import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.model';
import { PaymentMethod } from './payment-method.model';

@Entity()
export class Payment {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User)
	user: User;

	@ManyToOne(() => PaymentMethod)
	method: PaymentMethod;

	@Column({ type: 'float', default: 0.0 })
	amount: number;

	@Column({ type: 'bigint' })
	timestamp: number;
}
