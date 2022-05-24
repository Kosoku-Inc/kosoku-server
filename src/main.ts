import * as dotenv from 'dotenv';

if (process.env.NODE_ENV != 'production') {
	dotenv.config();
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './module/app.module';
import { logger } from './utils/logger.utils';

const bootstrap = async () => {
	const app = await NestFactory.create(AppModule);
	await app.listen(process.env.PORT || 3000);
};

bootstrap().catch(logger.error);
