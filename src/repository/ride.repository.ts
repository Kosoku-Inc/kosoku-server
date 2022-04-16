import { EntityRepository, Repository } from 'typeorm';
import { Ride } from '../model/ride.model';

@EntityRepository(Ride)
export class RideRepository extends Repository<Ride> {}
