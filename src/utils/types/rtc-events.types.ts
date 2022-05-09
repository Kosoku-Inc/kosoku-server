import { Location } from './location.types';
import { CarClass } from './car-class.types';
import { ExtendedRideRequest } from './ride-request.types';

export enum WSMessageType {
	RideRequest = 'RIDE_REQUEST',
	RideStatusChange = 'RIDE_STATUS_CHANGE',
	RideAccept = 'RIDE_ACCEPT',
	RideDecline = 'RIDE_DECLINE',
	RideTimeout = 'RIDE_TIMEOUT',
	RideStopSearch = 'RIDE_STOP_SEARCH',
	LocationUpdate = 'LOCATION_UPDATE',
	RestoreState = 'RESTORE_STATE',
}

export type WithUserRole<T> = {
	isClient: boolean;
	data: T;
};

export type SocketUserInfo = {
	location?: Location;
	companionId?: number;
	stopSearch?: () => void;
	rideId?: number;
	rideRequest?: ExtendedRideRequest;
};

export type DriverSocketUserInfo = SocketUserInfo & {
	carClass: CarClass;
	toPickUp?: Array<Location>;
};
