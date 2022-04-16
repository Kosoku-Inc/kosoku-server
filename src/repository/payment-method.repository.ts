import { EntityRepository, Repository } from 'typeorm';
import { PaymentMethod } from '../model/payment-method.model';

@EntityRepository(PaymentMethod)
export class PaymentMethodRepository extends Repository<PaymentMethod> {}
