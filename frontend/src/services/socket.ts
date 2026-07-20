import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = localStorage.getItem('studysync_token');
    socket = io(SOCKET_URL, {
      auth: {
        token
      },
      autoConnect: false
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  const token = localStorage.getItem('studysync_token');
  
  s.auth = { token };
  
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
