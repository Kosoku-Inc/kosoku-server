import { Injectable } from '@nestjs/common';
import StripeSDK from 'stripe';

export type CreateIntentOutput = {
	customerId: string;
	intent: StripeSDK.PaymentIntent;
};

@Injectable()
export class Stripe {
	private stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
	private usdRate = process.env.USD_RATE ? Number(process.env.USD_RATE) : 3;
	private stripe = new StripeSDK(this.stripeSecretKey as string, {
		apiVersion: '2020-08-27',
		typescript: true,
	});

	async createIntent(
		email: string,
		bynAmount: number,
		requestThreeDSecure,
		customerId?: string
	): Promise<CreateIntentOutput> {
		const customer = customerId ? { id: customerId } : await this.stripe.customers.create({ email });

		const params: StripeSDK.PaymentIntentCreateParams = {
			amount: bynAmount / this.usdRate,
			currency: 'usd',
			customer: customer.id,
			payment_method_options: {
				card: {
					request_three_d_secure: requestThreeDSecure || 'automatic',
				},
			},
			payment_method_types: ['card'],
		};

		const paymentIntent = await this.stripe.paymentIntents.create(params);

		return {
			intent: paymentIntent,
			customerId: customer.id,
		};
	}
}
