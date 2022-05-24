import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { RTCService } from '../service/rtc.service';
import { Socket } from 'socket.io';
import { WithUserRole, WSMessageType } from '../utils/types/rtc-events.types';
import { Location } from '../utils/types/location.types';
import { logger } from '../utils/logger.utils';
import { RideStatus } from '../utils/types/ride-status.types';
import { ExtendedRideRequest } from '../utils/types/ride-request.types';

@WebSocketGateway(Number.parseInt(process.env.PORT), { transports: ['websocket'] })
export class RTCController implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(private rtcService: RTCService) {}

	async handleConnection(socket: Socket) {
		this.rtcService.addUser(socket).catch(logger.error);
	}

	async handleDisconnect(socket: Socket) {
		this.rtcService.removeUser(socket).catch(logger.error);
	}

	// Driver & Client
	@SubscribeMessage(WSMessageType.LocationUpdate)
	handleLocationUpdate(@MessageBody() data: WithUserRole<Location>, @ConnectedSocket() client: Socket) {
		this.rtcService.handleLocationUpdate(data, client).catch(logger.error);
	}

	// Client-only
	@SubscribeMessage(WSMessageType.RideRequest)
	handleRideRequest(@MessageBody() data: WithUserRole<ExtendedRideRequest>, @ConnectedSocket() client: Socket) {
		this.rtcService.handleRideRequest(data, client).catch(logger.error);
	}

	// Client-only
	@SubscribeMessage(WSMessageType.RideStopSearch)
	handleRideStopSearch(@ConnectedSocket() client: Socket) {
		this.rtcService.handleStopSearch(client).catch(logger.error);
	}

	// Driver & Client
	@SubscribeMessage(WSMessageType.RideStatusChange)
	handleRideStatusChange(@MessageBody() data: WithUserRole<RideStatus>, @ConnectedSocket() client: Socket) {
		this.rtcService.handleRideStatusChange(data, client).catch(logger.error);
	}
}
