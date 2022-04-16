import { EntityRepository, Repository } from 'typeorm';
import { PaymentMethodDetails } from '../model/payment-method-details.model';

@EntityRepository(PaymentMethodDetails)
export class PaymentMethodDetailsRepository extends Repository<PaymentMethodDetails> {}
