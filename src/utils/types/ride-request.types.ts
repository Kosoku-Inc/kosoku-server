import { CarClass } from './car-class.types';
import { ExtendedLocation, Location } from './location.types';

export type RideRequest = {
	calculatedTime: number;
	route: Array<Location>; // TO-DO
	classes: Record<CarClass, number>; // Class - amount
};

export type ExtendedRideRequest = Omit<RideRequest, 'classes'> & {
	to: ExtendedLocation;
	from: ExtendedLocation;
	cost: number;
	carClass: CarClass;
};

export type ExtendedDriverRideRequest = ExtendedRideRequest & {
	toPickUp: Array<Location>;
};
