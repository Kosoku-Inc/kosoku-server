import { Module } from '@nestjs/common';
import { RTCController } from '../controller/rtc.controller';
import { RTCService } from '../service/rtc.service';
import { TokenModule } from './token.module';
import { UserModule } from './user.module';
import { GeoUtils } from '../utils/geo-utils.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RideRepository } from '../repository/ride.repository';
import { Directions } from '../integration/directions/directions.integration';
import { GoogleMaps } from '../integration/google-maps/google-maps.integration';

@Module({
	imports: [TokenModule, UserModule, TypeOrmModule.forFeature([RideRepository])],
	providers: [RTCController, RTCService, GeoUtils, Directions, GoogleMaps],
	exports: [RTCController],
})
export class RTCModule {}
