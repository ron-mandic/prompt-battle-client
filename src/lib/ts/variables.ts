import { Socket, io } from 'socket.io-client';

export const socket: Socket = io('http://localhost:3000', {
	reconnection: true
});
