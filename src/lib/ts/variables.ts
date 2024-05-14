import { Socket, io } from 'socket.io-client';
import { URL_SERVER } from './constants';

export const socket: Socket = io(URL_SERVER, {
	reconnection: true
});
