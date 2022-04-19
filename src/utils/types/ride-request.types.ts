import { CarClass } from './car-class.types';
import { ExtendedLocation } from './location.types';

export type RideRequest = {
	calculatedTime: number;
	route: unknown; // TO-DO
	classes: Record<CarClass, number>; // Class - amount
};

export type ExtendedRideRequest = Omit<RideRequest, 'classes'> & {
	to: ExtendedLocation;
	from: ExtendedLocation;
	cost: number;
	carClass: CarClass;
};
