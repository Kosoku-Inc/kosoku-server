import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { JwtAuthGuard } from '../security/jwt.guard';
import { Ride } from '../model/ride.model';

@Controller('/api/v1/user')
export class UserController {
	constructor(private userService: UserService) {}

	@Get()
	@UseGuards(JwtAuthGuard)
	getUser(@Request() req) {
		return this.userService.getUser(req.user.id);
	}

	@Get('/history')
	@UseGuards(JwtAuthGuard)
	getHistory(@Request() req) {
		return this.userService.getHistory(req.user.id);
	}

	@Get('/status')
	@UseGuards(JwtAuthGuard)
	getCurrentStatus(@Request() req): Promise<Ride | null> {
		return this.userService.getLatestRide(req.user.id);
	}
}
