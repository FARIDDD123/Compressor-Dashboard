// src/api/webSocketClient.ts

import { io, Socket } from 'socket.io-client';
import { getToken } from '../utils/storage';
import { logWebSocketError } from '../utils/errorLogger';

// Use import.meta.env for the WebSocket URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

interface SocketOptions {
  reconnection: boolean;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  reconnectionDelayMax: number;
  timeout: number;
  transports: string[];
  auth?: {
    token: string;
  };
  extraHeaders?: {
    Authorization: string;
  };
}

class WebSocketService {
  socket: Socket | null = null;

  connect(): void {
    // Connect only if there is no existing socket or it's disconnected
    if (!this.socket || !this.socket.connected) {
      // Get authentication token from secure storage
      const token = getToken();
      
      // Configure socket with authentication
      const socketOptions: SocketOptions = {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 20000,
        transports: ['websocket', 'polling'],
      };

      // Add authentication if token exists
      if (token) {
        socketOptions.auth = {
          token: token,
        };
        socketOptions.extraHeaders = {
          Authorization: `Bearer ${token}`,
        };
      }

      this.socket = io(SOCKET_URL, socketOptions);

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected with ID:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason: string) => {
        console.log('❌ WebSocket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected the socket, try to reconnect manually
          this.socket?.connect();
        }
      });

      this.socket.on('connect_error', (error: Error) => {
        logWebSocketError(error, 'connect_error');
        console.error('WebSocket connection error:', error);
        
        // If authentication failed, clear token and redirect to login
        if (error.message?.includes('authentication') || error.message?.includes('401')) {
          console.warn('WebSocket authentication failed, redirecting to login...');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      });

      // Handle authentication errors
      this.socket.on('unauthorized', (error: Error) => {
        logWebSocketError(error, 'unauthorized');
        console.error('WebSocket unauthorized:', error);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // A generic listener
  on(eventName: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  // A generic emitter
  emit(eventName: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(eventName, data);
    }
  }
  
  // A function to remove a listener to prevent memory leaks
  off(eventName: string): void {
    if (this.socket) {
      this.socket.off(eventName);
    }
  }
}

// Export a single instance of the service
const webSocketClient = new WebSocketService();
export default webSocketClient;

