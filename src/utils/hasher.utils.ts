import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Hasher {
	generateHash = async (data: string): Promise<string> => {
		return bcrypt.hash(data, 10);
	};

	compare = async (data: string, hash: string): Promise<string> => {
		return bcrypt.compare(data, hash);
	};
}
