import { Module } from '@nestjs/common';
import { TokenProvider } from '../security/jwt.provider';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../security/jwt.strategy';

@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '160000s' },
		}),
	],
	providers: [TokenProvider, JwtStrategy],
	exports: [TokenProvider],
})
export class TokenModule {}
