import { Module } from '@nestjs/common';
import { PaymentController } from '../controller/payment.controller';
import { PaymentService } from '../service/payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethodRepository } from '../repository/payment-method.repository';
import { PaymentMethodDetailsRepository } from '../repository/payment-method-details.repository';
import { UserRepository } from '../repository/user.repository';
import { PaymentRepository } from '../repository/payment.repository';
import { RideRepository } from '../repository/ride.repository';
import { Stripe } from '../integration/stripe/stripe.integration';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			PaymentMethodRepository,
			PaymentMethodDetailsRepository,
			UserRepository,
			PaymentRepository,
			RideRepository,
		]),
	],
	controllers: [PaymentController],
	providers: [PaymentService, Stripe],
	exports: [PaymentService],
})
export class PaymentModule {}
