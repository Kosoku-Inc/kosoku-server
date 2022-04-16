import { HttpException } from '@nestjs/common';

export class AlreadyExistsException extends HttpException {
	constructor(message: string) {
		super(message, 400);
	}
}
