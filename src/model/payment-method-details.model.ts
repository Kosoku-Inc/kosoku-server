import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CardBrand } from '../utils/types/card-brand.types';

@Entity()
export class PaymentMethodDetails {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	lastFour: string;

	@Column()
	exp: string;

	@Column()
	holder: string;

	@Column()
	brand: CardBrand;

	@Column({ unique: true })
	stripePaymentId: string;
}
