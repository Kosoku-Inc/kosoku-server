import { CardBrand } from '../../utils/types/card-brand.types';

export type SetAsDefaultOrRemoveInput = {
	methodId: number;
};

export type AddCardInput = {
	lastFour: string;
	exp: string;
	holder: string;
	brand: CardBrand;
	stripePaymentId: string;
};

export type ConfirmPaymentInput = {
	methodId: number;
	rideId: number;
	amount: number;
	paymentId?: string;
};

export type CreatePaymentIntentInput = {
	bynAmount: number;
	requestThreeDSecure?: 'any' | 'automatic';
};
