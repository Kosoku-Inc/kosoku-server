import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { JwtAuthGuard } from '../security/jwt.guard';
import { PaymentMethod } from '../model/payment-method.model';
import {
	AddCardInput,
	ConfirmPaymentInput,
	CreatePaymentIntentInput,
	SetAsDefaultOrRemoveInput,
} from '../dto/input/payment-dto.input';
import { StatusWrapper } from '../dto/output/common.output';
import { CreatePaymentIntentOutput } from '../dto/output/payment-dto.output';

@Controller('/api/v1/payments')
export class PaymentController {
	constructor(private paymentService: PaymentService) {}

	@Get()
	@UseGuards(JwtAuthGuard)
	async getPaymentMethods(@Request() req): Promise<Array<PaymentMethod>> {
		return this.paymentService.getPaymentMethods(req.user.id);
	}

	@Post('/default')
	@UseGuards(JwtAuthGuard)
	async setDefaultMethod(
		@Request() req,
		@Body() setAsDefaultInput: SetAsDefaultOrRemoveInput
	): Promise<StatusWrapper> {
		await this.paymentService.setDefaultMethod(req.user.id, setAsDefaultInput.methodId);

		return {
			status: 200,
		};
	}

	@Post('/add')
	@UseGuards(JwtAuthGuard)
	async addCard(@Request() req, @Body() addCardInput: AddCardInput): Promise<StatusWrapper> {
		await this.paymentService.addCard(req.user.id, addCardInput);

		return {
			status: 200,
		};
	}

	@Post('/intent')
	@UseGuards(JwtAuthGuard)
	async createPaymentIntent(
		@Request() req,
		@Body() createPaymentIntentInput: CreatePaymentIntentInput
	): Promise<CreatePaymentIntentOutput> {
		return this.paymentService.createPaymentIntent(req.user.id, createPaymentIntentInput);
	}

	@Post('/confirm')
	@UseGuards(JwtAuthGuard)
	async confirmPayment(@Request() req, @Body() confirmPaymentInput: ConfirmPaymentInput): Promise<StatusWrapper> {
		await this.paymentService.confirmPayment(req.user.id, confirmPaymentInput);

		return {
			status: 200,
		};
	}

	@Post('/remove')
	@UseGuards(JwtAuthGuard)
	async removePaymentMethod(@Request() req, @Body() removeInput: SetAsDefaultOrRemoveInput): Promise<StatusWrapper> {
		await this.paymentService.removeMethod(req.user.id, removeInput.methodId);

		return {
			status: 200,
		};
	}
}
