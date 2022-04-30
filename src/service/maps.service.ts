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
		const direction = await this.directions.getDirection(from, to);
		const time = Math.ceil(direction.minutes);

		return {
			calculatedTime: time,
			route: direction.route,
			classes: {
				[CarClass.Economy]: 3 + 0.3 * time,
				[CarClass.Comfort]: 4 + 0.4 * time,
				[CarClass.Business]: 5 + 0.5 * time,
			},
		};
	}
}
