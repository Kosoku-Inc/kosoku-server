import { Socket } from 'socket.io';
import { WSMessageType } from './types/rtc-events.types';

export const waitForSocketResponse = async (
	socket: Socket,
	timeout: number,
	...waitFor: WSMessageType[]
): Promise<{ event: WSMessageType; data: any }> => {
	return new Promise((resolve, reject) => {
		waitFor.forEach((msg) => {
			const listener = (data) => {
				socket.removeListener(msg, listener);
				resolve({ event: msg, data });
			};

			socket.on(msg, listener);

			setTimeout(reject, timeout);
		});
	});
};
