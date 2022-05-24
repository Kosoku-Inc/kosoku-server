import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GenerateTokenInput } from '../dto/input/auth-dto.input';
import { AuthOutput } from '../dto/output/auth-dto.output';

@Injectable()
export class TokenProvider {
	constructor(private jwtService: JwtService) {}

	decode(token: string): GenerateTokenInput | string {
		const data = this.jwtService.decode(token);

		return typeof data === 'string'
			? data
			: {
				email: data.email,
				id: data.id,
			  };
	}

	async generateToken(data: GenerateTokenInput): Promise<AuthOutput> {
		return {
			token: this.jwtService.sign(data),
			refreshToken: this.jwtService.sign(data, {
				expiresIn: '640000s',
			}),
		};
	}
}
