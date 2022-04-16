import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Gender } from '../utils/types/gender.types';
import { Driver } from './driver.model';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	email: string;

	@Column()
	phone: string;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column()
	gender: Gender;

	@Column({ nullable: true })
	stripeClientId?: string;

	@OneToOne(() => Driver)
	@JoinColumn()
	driver: Driver;
}
