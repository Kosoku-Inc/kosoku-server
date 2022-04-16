import {Injectable, UnauthorizedException} from '@nestjs/common';
import { AuthDataRepository } from '../repository/auth-data.repository';
import { AuthOutput } from '../dto/output/auth-dto.output';
import {GenerateTokenInput, RefreshTokensInput, RegisterInput} from '../dto/input/auth-dto.input';
import { TokenProvider } from '../security/jwt.provider';
import { UserService } from './user.service';
import { AlreadyExistsException } from '../utils/exceptions/already-exists.exception';
import { AuthData } from '../model/auth-data.model';
import { Hasher } from '../utils/hasher.utils';

@Injectable()
export class AuthService {
	constructor(
		private authDataRepository: AuthDataRepository,
		private tokenProvider: TokenProvider,
		private userService: UserService,
		private hasher: Hasher
	) {}

	async login(email: string, password: string): Promise<AuthOutput> {
		const existingData = await this.authDataRepository.findOne({ email });

		if (!existingData) {
			throw new AlreadyExistsException('Данная почта не зарегистрирована');
		}

		const isPasswordValid = await this.hasher.compare(password, existingData.passwordHash);

		if (!isPasswordValid) {
			throw new AlreadyExistsException('Неверный пароль');
		}

		return this.tokenProvider.generateToken({ email, id: existingData.id });
	}

	async register(data: RegisterInput): Promise<AuthOutput> {
		const existingData = await this.authDataRepository.findOne({ email: data.email });

		if (existingData) {
			throw new AlreadyExistsException('Данная почта уже используется');
		}

		const authData = new AuthData();

		authData.email = data.email;
		authData.passwordHash = await this.hasher.generateHash(data.password);

		await this.authDataRepository.save(authData);

		const user = await this.userService.createUser(data);

		return this.tokenProvider.generateToken({ email: user.email, id: user.id });
	}

	getUserFromToken(token: string): GenerateTokenInput | string {
		return this.tokenProvider.decode(token);
	}

	async refreshTokens(data: RefreshTokensInput): Promise<AuthOutput> {
		const user = this.getUserFromToken(data.refreshToken);

		if (typeof user !== 'object') {
			throw new UnauthorizedException();
		}

		return this.tokenProvider.generateToken(user as GenerateTokenInput);
	}
}
