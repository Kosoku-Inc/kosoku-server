import { Injectable } from '@nestjs/common';
import { ExtendedLocation } from '../../utils/types/location.types';
import { Language } from '@googlemaps/google-maps-services-js';
import { Location } from '../../utils/types/location.types';
import { places } from '../../mocks/places';
import { GeoUtils } from '../../utils/geo-utils.utils';
import { GoogleMaps } from '../google-maps/google-maps.integration';

@Injectable()
export class Geocoding {
	private mockGeocoding = process.env.MOCK_GEOCODING?.toLowerCase() === 'true' || !process.env.MOCK_GEOCODING;

	constructor(private geoUtils: GeoUtils, private maps: GoogleMaps) {}

	async decode(location: Location): Promise<ExtendedLocation> {
		if (this.mockGeocoding) {
			const data = places.find((place) => {
				const distance = this.geoUtils.getDistance(
					location.latitude,
					location.longitude,
					place.latitude,
					place.longitude,
					'K'
				);

				return distance < 1;
			});

			if (data) return data;

			return {
				latitude: location.latitude,
				longitude: location.longitude,
				readableLocation: `Заглушка #${(Math.random() * 100).toFixed()} для экономии ;p`,
			};
		} else {
			const decoded = await this.maps.client.reverseGeocode({
				params: {
					key: this.maps.mapsKey,
					latlng: location,
					language: Language.ru,
				},
			});

			return {
				latitude: location.latitude,
				longitude: location.longitude,
				readableLocation: decoded.data?.results[0]?.address_components[0]?.short_name ?? 'Неизвестно',
			};
		}
	}
}
