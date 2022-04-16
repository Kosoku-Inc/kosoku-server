import { Location } from './location.types';

export enum WSMessageType {
	RideRequest = 'RIDE_REQUEST',
	RideStatusChange = 'RIDE_STATUS_CHANGE',
	RideAccept = 'RIDE_ACCEPT',
	RideDecline = 'RIDE_DECLINE',
	RideStopSearch = 'RIDE_STOP_SEARCH',
	LocationUpdate = 'LOCATION_UPDATE',
}

export type WithUserRole<T> = {
	isClient: boolean;
	data: T;
};

export type SocketUserInfo = {
	location?: Location;
	companionId?: number;
	stopSearch?: () => void;
};
