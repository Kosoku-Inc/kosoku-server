import { Module } from '@nestjs/common';
import { MapsController } from '../controller/maps.controller';
import { MapsService } from '../service/maps.service';
import { Geocoding } from '../integration/geocoding/geocoding.integration';

@Module({
	imports: [],
	controllers: [MapsController],
	providers: [MapsService, Geocoding],
})
export class MapsModule {}
