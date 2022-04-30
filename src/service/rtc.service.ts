import { Injectable } from '@nestjs/common';
import { TokenProvider } from '../security/jwt.provider';
import { Socket } from 'socket.io';
import { GenerateTokenInput } from '../dto/input/auth-dto.input';
import { UserService } from './user.service';
import { User } from '../model/user.model';
import { Location } from '../utils/types/location.types';
import { DriverSocketUserInfo, SocketUserInfo, WithUserRole, WSMessageType } from '../utils/types/rtc-events.types';
import { RideStatus } from '../utils/types/ride-status.types';
import { GeoUtils } from '../utils/geo-utils.utils';
import { waitForSocketResponse } from '../utils/awaitable-socket.utils';
import { logger } from '../utils/logger.utils';
import { ExtendedRideRequest } from '../utils/types/ride-request.types';
import { RideRepository } from '../repository/ride.repository';
import { Ride } from '../model/ride.model';
import { Directions } from '../integration/directions/directions.integration';

@Injectable()
export class RTCService {
	private readonly idBasedSocketHolder: Map<number, Socket>;
	private readonly socketBasedIdHolder: WeakMap<Socket, number>;
	private readonly clientDataHolder: Map<number, SocketUserInfo>;
	private readonly driverDataHolder: Map<number, DriverSocketUserInfo>;

	constructor(
		private tokenProvider: TokenProvider,
		private userService: UserService,
		private geoUtils: GeoUtils,
		private rideRepository: RideRepository,
		private directions: Directions
	) {
		this.clientDataHolder = new Map<number, SocketUserInfo>();
		this.driverDataHolder = new Map<number, DriverSocketUserInfo>();
		this.idBasedSocketHolder = new Map<number, Socket>();
		this.socketBasedIdHolder = new WeakMap<Socket, number>();
	}

	private async getUserFromSocket(socket: Socket): Promise<User> {
		const token = (socket.handshake.auth?.Authorization as string)?.split('Bearer ')[1];

		if (!token) {
			socket.disconnect();
			return;
		}

		const data = this.tokenProvider.decode(token) as GenerateTokenInput;

		if (!data.id) {
			socket.disconnect();
			return;
		}

		return this.userService.getUser(data.id);
	}

	async addUser(socket: Socket) {
		const user = await this.getUserFromSocket(socket);

		if (user.driver) {
			this.driverDataHolder.set(user.id, { carClass: user.driver.carClass });
		} else {
			this.clientDataHolder.set(user.id, {});
		}

		this.idBasedSocketHolder.set(user.id, socket);
		this.socketBasedIdHolder.set(socket, user.id);
	}

	async removeUser(socket: Socket) {
		const user = await this.getUserFromSocket(socket);

		if (user.driver) {
			this.driverDataHolder.delete(user.id);
		} else {
			this.clientDataHolder.delete(user.id);
		}

		this.idBasedSocketHolder.delete(user.id);
		this.socketBasedIdHolder.delete(socket);
	}

	async handleLocationUpdate(location: WithUserRole<Location>, socket: Socket) {
		const toSearchIn = location.isClient ? this.clientDataHolder : this.driverDataHolder;
		const userId = this.socketBasedIdHolder.get(socket);
		// We setting this data on init, so it cant be undefined
		const info = toSearchIn.get(userId) as SocketUserInfo;
		info.location = location.data;

		// Call S2 here
		toSearchIn.set(userId, info);

		// If this user on ride - send update to companion
		if (info.companionId) {
			this.idBasedSocketHolder.get(info.companionId)?.emit(WSMessageType.LocationUpdate, {
				from: userId,
				location,
			});
		}
	}

	async handleRideRequest(request: WithUserRole<ExtendedRideRequest>, socket: Socket) {
		const userId = this.socketBasedIdHolder.get(socket);
		const user = this.clientDataHolder.get(userId);
		let driver: [number, SocketUserInfo] | null = null;
		let wasStopped = false;

		await this.handleStopSearch(socket);

		return new Promise(async (resolve, reject) => {
			user.stopSearch = () => {
				reject('Поиск остановлен');
				wasStopped = true;
			};

			const sortedList = this.geoUtils
				.toSortedList(user.location, this.driverDataHolder)
				.filter((value) => (value[1] as DriverSocketUserInfo).carClass === request.data.carClass); //LUL

			for await (const entry of sortedList) {
				const socket = this.idBasedSocketHolder.get(entry[0]);
				const toPickUp = await this.directions.getDirection(entry[1].location, request.data.from);

				socket.emit(WSMessageType.RideRequest, {
					...request,
					data: {
						...request.data,
						toPickUp: toPickUp.route,
					},
				});

				try {
					const result = await waitForSocketResponse(
						socket,
						20000,
						WSMessageType.RideTimeout,
						WSMessageType.RideAccept,
						WSMessageType.RideDecline
					);

					if (result.event === WSMessageType.RideAccept) {
						driver = entry;
						break;
					}
				} catch (e) {
					logger.log('Next car...');
				}
			}

			user.stopSearch = null;

			if (!driver) {
				socket.emit(WSMessageType.RideDecline);
				return;
			}

			if (wasStopped) {
				this.idBasedSocketHolder.get(driver[0]).emit(WSMessageType.RideDecline);
				return;
			}

			// Cant stop ride starting after this
			user.stopSearch = null;

			user.companionId = driver[0];
			this.driverDataHolder.get(driver[0]).companionId = userId;

			const dbDriver = await this.userService.getUser(driver[0]);
			const dbClient = await this.userService.getUser(userId);

			const ride = new Ride();

			ride.client = dbClient;
			ride.driver = dbDriver;
			ride.cost = request.data.cost;
			ride.to = request.data.to.readableLocation;
			ride.from = request.data.from.readableLocation;
			ride.status = RideStatus.Starting;
			ride.startTime = Date.now();

			await this.rideRepository.save(ride);

			this.driverDataHolder.get(driver[0]).rideId = ride.id;

			socket.emit(WSMessageType.RideAccept, ride);
			this.idBasedSocketHolder.get(driver[0]).emit(WSMessageType.RideAccept, ride);
		});
	}

	async handleStopSearch(socket: Socket) {
		const clientId = this.socketBasedIdHolder.get(socket);
		const client = this.clientDataHolder.get(clientId);

		client.stopSearch && client.stopSearch();
	}

	async handleRideStatusChange(status: WithUserRole<RideStatus>, socket: Socket) {
		const driverId = this.socketBasedIdHolder.get(socket);
		const driverData = this.driverDataHolder.get(driverId);

		const ride = await this.rideRepository.findOneOrFail(driverData.rideId);

		ride.status = status.data;

		if (status.data === RideStatus.Completed) {
			const driver = await this.userService.getUser(driverId);
			driver.driver.balance = driver.driver.balance + ride.cost;
			await this.userService.saveUser(driver);

			ride.endTime = Date.now();
		}

		this.idBasedSocketHolder
			.get(driverData.companionId)
			?.emit(WSMessageType.RideStatusChange, { status: status.data });

		await this.rideRepository.save(ride);
	}
}
