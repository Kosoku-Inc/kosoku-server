import { Injectable } from '@nestjs/common';
import { ExtendedLocation } from '../../utils/types/location.types';
import { places } from '../../mocks/places';
import { GoogleMaps } from '../google-maps/google-maps.integration';
import { Language } from '@googlemaps/google-maps-services-js';

@Injectable()
export class Places {
	private mockPlaces = process.env.MOCK_PLACES?.toLowerCase() === 'true' || !process.env.MOCK_PLACES;

	constructor(private maps: GoogleMaps) {}

	async search(part: string): Promise<Array<ExtendedLocation>> {
		if (this.mockPlaces) {
			return places.filter((place) => place.readableLocation.toLowerCase().includes(part.toLowerCase()));
		} else {
			const result = await this.maps.client.placeAutocomplete({
				params: {
					key: this.maps.mapsKey,
					input: part,
					language: Language.ru,
				},
			});

			return result.data.predictions.map((prediction) => ({
				readableLocation: prediction.description,
				longitude: (prediction as any).location.lng,
				latitude: (prediction as any).location.lat,
			}));
		}
	}
}
