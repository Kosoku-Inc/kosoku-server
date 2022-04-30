import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.model';
import { Payment } from './payment.model';
import { RideStatus } from '../utils/types/ride-status.types';

@Entity()
export class Ride {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User)
	client: User;

	@ManyToOne(() => User)
	driver: User;

	@OneToOne(() => Payment, { nullable: true })
	@JoinColumn()
	payment?: Payment;

	@Column({ type: 'float', default: 0.0 })
	cost: number;

	@Column({ nullable: true, type: 'bigint' })
	startTime?: number;

	@Column({ nullable: true, type: 'bigint' })
	endTime?: number;

	@Column()
	to: string;

	@Column()
	from: string;

	@Column()
	status: RideStatus;

	@Column({ default: false })
	paid: boolean;
}
