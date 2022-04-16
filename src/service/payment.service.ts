import { Injectable } from '@nestjs/common';
import { PaymentMethodRepository } from '../repository/payment-method.repository';
import { PaymentMethod } from '../model/payment-method.model';
import { PaymentMethodType } from '../utils/types/payment-method-type.types';
import { PaymentMethodDetails } from '../model/payment-method-details.model';
import { PaymentMethodDetailsRepository } from '../repository/payment-method-details.repository';
import { User } from '../model/user.model';
import { AddCardInput, ConfirmPaymentInput, CreatePaymentIntentInput } from '../dto/input/payment-dto.input';
import { UserRepository } from '../repository/user.repository';
import { PaymentRepository } from '../repository/payment.repository';
import { RideRepository } from '../repository/ride.repository';
import { Payment } from '../model/payment.model';
import { CreatePaymentIntentOutput } from '../dto/output/payment-dto.output';
import { Stripe } from '../integration/stripe/stripe.integration';

@Injectable()
export class PaymentService {
	constructor(
		private paymentRepository: PaymentRepository,
		private paymentMethodRepository: PaymentMethodRepository,
		private paymentMethodDetailsRepository: PaymentMethodDetailsRepository,
		private userRepository: UserRepository,
		private rideRepository: RideRepository,
		private stripe: Stripe
	) {}

	async createPaymentMethod(user: User, type: PaymentMethodType): Promise<PaymentMethod> {
		const paymentMethod = new PaymentMethod();

		paymentMethod.isDefault = type === PaymentMethodType.Cash;
		paymentMethod.type = type;
		paymentMethod.user = user;

		await this.paymentMethodRepository.save(paymentMethod);

		return paymentMethod;
	}

	async getPaymentMethods(id: number): Promise<Array<PaymentMethod>> {
		return this.paymentMethodRepository.find({ where: [{ user: { id }, isVisible: true }], relations: ['details'] });
	}

	async setDefaultMethod(userId: number, methodId: number) {
		const methods = await this.paymentMethodRepository.find({ where: [{ user: { id: userId } }] });

		methods.forEach((method) => (method.isDefault = method.id === methodId));

		await this.paymentMethodRepository.save(methods);
	}

	async addCard(userId: number, cardData: AddCardInput) {
		const user = await this.userRepository.findOneOrFail({ id: userId });

		const details = new PaymentMethodDetails();

		details.exp = cardData.exp;
		details.stripePaymentId = cardData.stripePaymentId;
		details.brand = cardData.brand;
		details.holder = cardData.holder;
		details.lastFour = cardData.lastFour;

		await this.paymentMethodDetailsRepository.save(details);

		const card = await this.createPaymentMethod(user, PaymentMethodType.Card);

		card.details = details;

		await this.paymentMethodRepository.save(card);
	}

	async removeMethod(userId: number, methodId: number) {
		const method = await this.paymentMethodRepository.findOneOrFail({
			where: [{ id: methodId }],
			relations: ['details'],
		});

		if (method.type === PaymentMethodType.Cash) return;

		if (method.isDefault) {
			const cash = await this.paymentMethodRepository.findOneOrFail({
				user: { id: userId },
				type: PaymentMethodType.Cash,
			});

			cash.isDefault = true;

			await this.paymentMethodRepository.save(cash);
		}

		method.isVisible = false;
		await this.paymentMethodRepository.save(method);
	}

	async confirmPayment(userId: number, paymentData: ConfirmPaymentInput) {
		const user = await this.userRepository.findOneOrFail({ id: userId });
		const paymentMethod = await this.paymentMethodRepository.findOneOrFail({
			id: paymentData.methodId,
			user: { id: userId },
		});
		const ride = await this.rideRepository.findOneOrFail({ id: paymentData.rideId });
		const payment = new Payment();

		payment.method = paymentMethod;
		payment.amount = paymentData.amount;
		payment.timestamp = Date.now();
		payment.user = user;
		payment.stripePaymentId = paymentData.paymentId;

		await this.paymentRepository.save(payment);

		ride.payment = payment;
		ride.paid = true;

		await this.rideRepository.save(ride);
	}

	async createPaymentIntent(userId: number, data: CreatePaymentIntentInput): Promise<CreatePaymentIntentOutput> {
		const user = await this.userRepository.findOneOrFail({ id: userId });

		const result = await this.stripe.createIntent(
			user.email,
			data.bynAmount,
			data.requestThreeDSecure,
			user.stripeClientId
		);

		if (result.customerId !== user.stripeClientId) {
			user.stripeClientId = result.customerId;

			await this.userRepository.save(user);
		}

		return {
			clientSecret: result.intent.client_secret,
		};
	}
}
