import { EntityRepository, Repository } from 'typeorm';
import { User } from '../model/user.model';

@EntityRepository(User)
export class UserRepository extends Repository<User> {}
