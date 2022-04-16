import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { User } from '../model/user.model';
import { RegisterInput } from '../dto/input/auth-dto.input';
import { Driver } from '../model/driver.model';
import { DriverRepository } from '../repository/driver.repository';
import { RideRepository } from '../repository/ride.repository';
import { Ride } from '../model/ride.model';
import { PaymentService } from './payment.service';
import { PaymentMethodType } from '../utils/types/payment-method-type.types';

@Injectable()
export class UserService {
	constructor(
		private userRepository: UserRepository,
		private driverRepository: DriverRepository,
		private rideRepository: RideRepository,
		private paymentService: PaymentService
	) {}

	async getUser(id: number): Promise<User> {
		return this.userRepository.findOneOrFail({ id }, { relations: ['driver'] });
	}

	async createUser(data: RegisterInput): Promise<User> {
		const user = new User();

		user.email = data.email;
		user.gender = data.gender;
		user.phone = data.phone;
		user.lastName = data.lastName;
		user.firstName = data.firstName;

		if (data.driver) {
			const driver = new Driver();

			driver.carClass = data.driver.carClass;
			driver.carBrand = data.driver.carBrand;
			driver.balance = 0;

			await this.driverRepository.save(driver);

			user.driver = driver;
		}

		await this.userRepository.save(user);

		await this.paymentService.createPaymentMethod(user, PaymentMethodType.Cash);

		return user;
	}

	async getHistory(id: number): Promise<Array<Ride>> {
		const user = await this.getUser(id);
		const key = user.driver ? 'driver' : 'client';

		return this.rideRepository.find({
			where: [{ [key]: { id } }],
			relations: ['driver', 'client', 'driver.driver'],
		});
	}

	async getLatestRide(id: number): Promise<Ride | null> {
		return this.rideRepository.findOne({
			where: [{ paid: false, client: { id } }],
		});
	}
}
