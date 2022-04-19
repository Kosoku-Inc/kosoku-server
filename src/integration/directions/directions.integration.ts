import { Injectable } from '@nestjs/common';
import { Location } from '../../utils/types/location.types';
import { GoogleMaps } from '../google-maps/google-maps.integration';
import { Language } from '@googlemaps/google-maps-services-js';

@Injectable()
export class Directions {
	private mockDirections = process.env.MOCK_DIRECTIONS?.toLowerCase() === 'true' || !process.env.MOCK_GEOCODING;

	constructor(private maps: GoogleMaps) {}

	async getDirection(from: Location, to: Location) {
		if (this.mockDirections) {
		} else {
			const result = await this.maps.client.directions({
				params: {
					key: this.maps.mapsKey,
					origin: from,
					destination: to,
					language: Language.ru,
				},
			});

			//result.data.routes[0].overview_polyline
		}
	}
}
