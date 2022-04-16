import { Injectable } from '@nestjs/common';
import { ExtendedLocation } from '../../utils/types/location.types';
import axios from 'axios';
import { Client, Language } from '@googlemaps/google-maps-services-js';
import { Location } from '../../utils/types/location.types';

@Injectable()
export class Geocoding {
	private mapsKey = process.env.DIRECTIONS_GATEWAY_API_KEY || '';
	private mockGeocoding = process.env.MOCK_GEOCODING?.toLowerCase() === 'true' || !process.env.MOCK_GEOCODING;
	private mockDirections = process.env.MOCK_DIRECTIONS?.toLowerCase() === 'true' || !process.env.MOCK_GEOCODING;
	private client = new Client({ axiosInstance: axios.create() });

	async decode(location: Location): Promise<ExtendedLocation> {
		if (this.mockGeocoding) {
			return {
				latitude: location.latitude,
				longitude: location.longitude,
				readableLocation: `Заглушка #${(Math.random() * 100).toFixed()} для экономии ;p`,
			};
		} else {
			const decoded = await this.client.reverseGeocode({
				params: {
					key: this.mapsKey,
					latlng: location,
					language: Language.ru,
				},
			});

			console.log(JSON.stringify(decoded.data));

			return {
				latitude: location.latitude,
				longitude: location.longitude,
				readableLocation: decoded.data?.results[0]?.address_components[0]?.short_name ?? 'Неизвестно',
			};
		}
	}
}
