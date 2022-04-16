import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginInput, RefreshTokensInput, RegisterInput } from '../dto/input/auth-dto.input';
import { AuthOutput } from '../dto/output/auth-dto.output';

@Controller('/api/v1/auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('/login')
	async login(@Body() data: LoginInput): Promise<AuthOutput> {
		return this.authService.login(data.email, data.password);
	}

	@Post('/register')
	async register(@Body() data: RegisterInput): Promise<AuthOutput> {
		return this.authService.register(data);
	}

	@Post('/refresh')
	async refreshToken(@Body() data: RefreshTokensInput): Promise<AuthOutput> {
		return this.authService.refreshTokens(data);
	}
}
