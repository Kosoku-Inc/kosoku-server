import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuthData {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	email: string;

	@Column()
	passwordHash: string;
}
