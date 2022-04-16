import { EntityRepository, Repository } from 'typeorm';
import { AuthData } from '../model/auth-data.model';

@EntityRepository(AuthData)
export class AuthDataRepository extends Repository<AuthData> {}
