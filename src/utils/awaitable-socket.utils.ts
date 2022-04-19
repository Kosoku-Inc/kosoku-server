import { Socket } from 'socket.io';
import { WSMessageType } from './types/rtc-events.types';

export const waitForSocketResponse = async (
	socket: Socket,
	timeout: number,
	onTimeoutEvent: WSMessageType,
	...waitFor: WSMessageType[]
): Promise<{ event: WSMessageType; data: any }> => {
	let wasResolved = false;

	return new Promise((resolve, reject) => {
		waitFor.forEach((msg) => {
			const listener = (data) => {
				socket.removeListener(msg, listener);
				wasResolved = true;
				resolve({ event: msg, data });
			};

			socket.on(msg, listener);

			setTimeout(() => {
				if (wasResolved) return;

				socket.emit(onTimeoutEvent);
				reject();
			}, timeout);
		});
	});
};
