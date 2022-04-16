import { Module } from '@nestjs/common';
import { RTCController } from '../controller/rtc.controller';
import { RTCService } from '../service/rtc.service';
import { TokenModule } from './token.module';
import { UserModule } from './user.module';
import { GeoUtils } from '../utils/geo-utils.utils';

@Module({
	imports: [TokenModule, UserModule],
	providers: [RTCController, RTCService, GeoUtils],
	exports: [RTCController],
})
export class RTCModule {}
