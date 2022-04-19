import { Injectable } from '@nestjs/common';
import { ExtendedLocation } from '../../utils/types/location.types';
import { places } from '../../mocks/places';

@Injectable()
export class Places {
	private mockPlaces = process.env.MOCK_PLACES?.toLowerCase() === 'true' || !process.env.MOCK_PLACES;

	async search(part: string): Promise<Array<ExtendedLocation>> {
		if (this.mockPlaces) {
			return places.filter((place) => place.readableLocation.toLowerCase().includes(part.toLowerCase()));
		} else {
			return []; //Add implementation via Google lib
		}
	}
}
