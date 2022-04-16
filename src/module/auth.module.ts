import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenModule } from './token.module';
import { AuthService } from '../service/auth.service';
import { AuthController } from '../controller/auth.controller';
import { AuthDataRepository } from '../repository/auth-data.repository';
import { UserModule } from './user.module';
import { Hasher } from '../utils/hasher.utils';

@Module({
	imports: [TypeOrmModule.forFeature([AuthDataRepository]), TokenModule, UserModule],
	controllers: [AuthController],
	providers: [AuthService, Hasher],
	exports: [AuthService],
})
export class AuthModule {}
