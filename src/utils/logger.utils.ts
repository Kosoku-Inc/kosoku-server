import { Injectable } from '@nestjs/common';

@Injectable()
export class Logger {
	log = console.log;

	error = console.error;
}

export const logger = new Logger();
