import {io} from 'socket.io-client';

export const socket = io(`http://192.168.1.3:8000/`);
// export const socket = io(`http://localhost:8000/`);
