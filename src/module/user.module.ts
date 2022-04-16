import { Module } from '@nestjs/common';
import { UserController } from '../controller/user.controller';
import { UserService } from '../service/user.service';
import { UserRepository } from '../repository/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverRepository } from '../repository/driver.repository';
import { RideRepository } from '../repository/ride.repository';
import { PaymentRepository } from '../repository/payment.repository';
import { PaymentMethodRepository } from '../repository/payment-method.repository';
import { PaymentMethodDetailsRepository } from '../repository/payment-method-details.repository';
import { PaymentModule } from './payment.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			UserRepository,
			DriverRepository,
			RideRepository,
			PaymentRepository,
			PaymentMethodRepository,
			PaymentMethodDetailsRepository,
		]),
		PaymentModule,
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
