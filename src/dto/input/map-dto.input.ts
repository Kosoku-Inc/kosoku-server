import { Location } from '../../utils/types/location.types';

export type DecodeInput = {
	location: Location;
};

export type DirectionsInput = {
	to: Location;
	from: Location;
};

export type PlacesInput = {
	toSearch: string;
};
