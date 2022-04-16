import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	constructor(private userRepository: UserRepository) {
		super();
	}

	canActivate(context: ExecutionContext) {
		// Add your custom authentication logic here
		// for example, call super.logIn(request) to establish a session.
		return super.canActivate(context);
	}

	handleRequest(err, user) {
		// You can throw an exception based on either "info" or "err" arguments
		if (err || !user) {
			throw err || new UnauthorizedException();
		}

		return user;
	}
}
