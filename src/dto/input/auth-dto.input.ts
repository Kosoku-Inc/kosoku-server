import { Gender } from '../../utils/types/gender.types';
import { CarClass } from '../../utils/types/car-class.types';

export type GenerateTokenInput = {
	email: string;
	id: number;
};

export type LoginInput = {
	email: string;
	password: string;
};

export type RegisterInput = {
	email: string;
	password: string;
	phone: string;
	firstName: string;
	lastName: string;
	gender: Gender;
	driver?: {
		carBrand: string;
		carClass: CarClass;
	};
};

export type RefreshTokensInput = {
	refreshToken: string;
};
