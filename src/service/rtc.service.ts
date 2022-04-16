import { Injectable } from '@nestjs/common';
import { TokenProvider } from '../security/jwt.provider';
import { Socket } from 'socket.io';
import { GenerateTokenInput } from '../dto/input/auth-dto.input';
import { UserService } from './user.service';
import { User } from '../model/user.model';
import { ExtendedLocation, Location } from '../utils/types/location.types';
import { SocketUserInfo, WithUserRole, WSMessageType } from '../utils/types/rtc-events.types';
import { RideStatus } from '../utils/types/ride-status.types';
import { GeoUtils } from '../utils/geo-utils.utils';
import { waitForSocketResponse } from '../utils/awaitable-socket.utils';
import { logger } from '../utils/logger.utils';

@Injectable()
export class RTCService {
	private readonly idBasedSocketHolder: Map<number, Socket>;
	private readonly socketBasedSocketHolder: WeakMap<Socket, number>;
	private readonly clientConnectionHolder: Map<number, SocketUserInfo>;
	private readonly driverConnectionHolder: Map<number, SocketUserInfo>;

	constructor(private tokenProvider: TokenProvider, private userService: UserService, private geoUtils: GeoUtils) {
		this.clientConnectionHolder = new Map<number, SocketUserInfo>();
		this.driverConnectionHolder = new Map<number, SocketUserInfo>();
		this.idBasedSocketHolder = new Map<number, Socket>();
		this.socketBasedSocketHolder = new WeakMap<Socket, number>();
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
			this.driverConnectionHolder.set(user.id, {});
		} else {
			this.clientConnectionHolder.set(user.id, {});
		}

		this.idBasedSocketHolder.set(user.id, socket);
		this.socketBasedSocketHolder.set(socket, user.id);
	}

	async removeUser(socket: Socket) {
		const user = await this.getUserFromSocket(socket);

		if (user.driver) {
			this.driverConnectionHolder.delete(user.id);
		} else {
			this.clientConnectionHolder.delete(user.id);
		}

		this.idBasedSocketHolder.delete(user.id);
		this.socketBasedSocketHolder.delete(socket);
	}

	async handleLocationUpdate(location: WithUserRole<Location>, socket: Socket) {
		const toSearchIn = location.isClient ? this.clientConnectionHolder : this.driverConnectionHolder;
		const userId = this.socketBasedSocketHolder.get(socket);
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

	async handleRideRequest(location: WithUserRole<ExtendedLocation>, socket: Socket) {
		const userId = this.socketBasedSocketHolder.get(socket);
		const user = this.clientConnectionHolder.get(userId);
		let driver: [number, SocketUserInfo] | null = null;

		return new Promise(async (resolve, reject) => {
			user.stopSearch = () => reject('Поиск остановлен');

			const sortedList = this.geoUtils.toSortedList(location.data, this.driverConnectionHolder); //LUL

			for await (const entry of sortedList) {
				const socket = this.idBasedSocketHolder.get(entry[0]);
				socket.emit(WSMessageType.RideRequest, location);

				try {
					const result = await waitForSocketResponse(
						socket,
						10000,
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
				socket.send(WSMessageType.RideDecline);
				return;
			}

			user.companionId = driver[0];
			this.driverConnectionHolder.get(driver[0]).companionId = userId;

			socket.send(WSMessageType.RideStatusChange, { status: RideStatus.Starting });
		});
	}

	async handleStopSearch(socket: Socket) {
		const clientId = this.socketBasedSocketHolder.get(socket);
		const client = this.clientConnectionHolder.get(clientId);

		client.stopSearch && client.stopSearch();
	}

	async handleRideStatusChange(status: WithUserRole<RideStatus>, socket: Socket) {
		console.log(status);
	}
}
