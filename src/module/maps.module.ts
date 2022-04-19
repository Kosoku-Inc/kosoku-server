import { Module } from '@nestjs/common';
import { MapsController } from '../controller/maps.controller';
import { MapsService } from '../service/maps.service';
import { Geocoding } from '../integration/geocoding/geocoding.integration';
import { Places } from '../integration/places/places.integration';
import { GeoUtils } from '../utils/geo-utils.utils';
import { Directions } from '../integration/directions/directions.integration';
import { GoogleMaps } from '../integration/google-maps/google-maps.integration';

@Module({
	imports: [],
	controllers: [MapsController],
	providers: [MapsService, GoogleMaps, Geocoding, Places, Directions, GeoUtils],
})
export class MapsModule {}
