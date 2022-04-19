import { Injectable } from '@nestjs/common';
import { ExtendedLocation } from '../utils/types/location.types';
import { Geocoding } from '../integration/geocoding/geocoding.integration';
import { Location } from '../utils/types/location.types';
import { Places } from '../integration/places/places.integration';
import { Directions } from '../integration/directions/directions.integration';
import { DirectionsOutput } from '../dto/output/map-dto.output';
import { CarClass } from '../utils/types/car-class.types';

@Injectable()
export class MapsService {
	constructor(private geocoding: Geocoding, private places: Places, private directions: Directions) {}

	async decode(data: Location): Promise<ExtendedLocation> {
		return this.geocoding.decode(data);
	}

	async searchPlaces(toSearch: string): Promise<Array<ExtendedLocation>> {
		return this.places.search(toSearch);
	}

	async getDirection(from: Location, to: Location): Promise<DirectionsOutput> {
		const direction = this.directions.getDirection(from, to);

		return {
			calculatedTime: 12,
			route: direction,
			classes: {
				[CarClass.Economy]: 8,
				[CarClass.Comfort]: 10,
				[CarClass.Business]: 12,
			},
		};
	}
}
