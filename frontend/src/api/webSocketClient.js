// src/api/webSocketClient.js

import { io } from 'socket.io-client';

// --- CHANGE: Use import.meta.env for the WebSocket URL ---
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class WebSocketService {
  socket;

  connect() {
    // Connect only if there is no existing socket or it's disconnected
    if (!this.socket || !this.socket.connected) {
      this.socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected with ID:', this.socket.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // A generic listener
  on(eventName, callback) {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  // A generic emitter
  emit(eventName, data) {
    if (this.socket) {
      this.socket.emit(eventName, data);
    }
  }
  
  // A function to remove a listener to prevent memory leaks
  off(eventName) {
    if (this.socket) {
        this.socket.off(eventName);
    }
  }
}

// Export a single instance of the service
const webSocketClient = new WebSocketService();
export default webSocketClient;