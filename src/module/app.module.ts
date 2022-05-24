import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth.module';
import { MapsModule } from './maps.module';
import { PaymentModule } from './payment.module';
import { RTCModule } from './rtc.module';
import { UserModule } from './user.module';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.DATABASE_HOST,
			port: parseInt(process.env.DATABASE_PORT),
			username: process.env.DATABASE_USERNAME,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_NAME,
			name: 'default',
			autoLoadEntities: true,
			synchronize: true,
			ssl: {
				rejectUnauthorized: false,
			},
		}),
		AuthModule,
		MapsModule,
		PaymentModule,
		RTCModule,
		UserModule,
	],
})
export class AppModule {}
