import { CarClass } from '../utils/types/car-class.types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Driver {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	carBrand: string;

	@Column()
	carClass: CarClass;

	@Column({ type: 'float', default: 0.0 })
	balance: number;
}
