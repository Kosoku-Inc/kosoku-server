import { EntityRepository, Repository } from 'typeorm';
import { Payment } from '../model/payment.model';

@EntityRepository(Payment)
export class PaymentRepository extends Repository<Payment> {}
