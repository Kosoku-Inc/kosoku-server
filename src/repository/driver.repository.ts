import { EntityRepository, Repository } from 'typeorm';
import { Driver } from '../model/driver.model';

@EntityRepository(Driver)
export class DriverRepository extends Repository<Driver> {}
