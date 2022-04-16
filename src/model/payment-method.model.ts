import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentMethodType } from '../utils/types/payment-method-type.types';
import { PaymentMethodDetails } from './payment-method-details.model';
import { User } from './user.model';

@Entity()
export class PaymentMethod {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	type: PaymentMethodType;

	@Column()
	isDefault: boolean;

	@Column({ default: true })
	isVisible: boolean;

	@OneToOne(() => PaymentMethodDetails, { nullable: true, onDelete: 'CASCADE' })
	@JoinColumn()
	details?: PaymentMethodDetails;

	@ManyToOne(() => User)
	user: User;
}
