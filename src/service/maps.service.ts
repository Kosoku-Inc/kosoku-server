import { Injectable } from '@nestjs/common';
import { ExtendedLocation } from '../utils/types/location.types';
import { Geocoding } from '../integration/geocoding/geocoding.integration';
import { Location } from '../utils/types/location.types';

@Injectable()
export class MapsService {
	constructor(private geocoding: Geocoding) {}

	async decode(data: Location): Promise<ExtendedLocation> {
		return this.geocoding.decode(data);
	}
}
