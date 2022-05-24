import { Injectable } from '@nestjs/common';
import { Location } from '../../utils/types/location.types';
import { GoogleMaps } from '../google-maps/google-maps.integration';
import { Language } from '@googlemaps/google-maps-services-js';

@Injectable()
export class Directions {
	private mockDirections = process.env.MOCK_DIRECTIONS?.toLowerCase() === 'true' || !process.env.MOCK_GEOCODING;

	constructor(private maps: GoogleMaps) {}

	async getDirection(
		from: Location,
		to: Location
	): Promise<{
		minutes: number;
		route: Array<Location>;
	}> {
		const result = await this.maps.client.directions({
			params: {
				key: this.maps.mapsKey,
				origin: from,
				destination: to,
				language: Language.ru,
			},
		});

		return {
			minutes: result.data.routes[0].legs[0].duration.value / 60,
			route: result.data.routes[0].overview_path.map((path) => ({
				latitude: path.lat,
				longitude: path.lng,
			})),
		};
	}
}
