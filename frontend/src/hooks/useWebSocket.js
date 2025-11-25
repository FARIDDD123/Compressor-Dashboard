// src/hooks/useWebSocket.js

import { useEffect, useState, useCallback } from 'react';
import webSocketClient from '../api/webSocketClient';

/**
 * A custom hook to manage WebSocket interactions.
 * @param {Object} eventHandlers - An object where keys are event names and values are handler functions.
 * e.g., { 'new_data': (data) => console.log(data) }
 */
const useWebSocket = (eventHandlers) => {
  const [isConnected, setIsConnected] = useState(webSocketClient.socket?.connected || false);

  useEffect(() => {
    // Connect the socket
    webSocketClient.connect();

    // Setup basic connection listeners
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    webSocketClient.on('connect', onConnect);
    webSocketClient.on('disconnect', onDisconnect);

    // Register all custom event handlers passed to the hook
    for (const eventName in eventHandlers) {
      if (Object.hasOwnProperty.call(eventHandlers, eventName)) {
        webSocketClient.on(eventName, eventHandlers[eventName]);
      }
    }

    // Cleanup function when the component unmounts
    return () => {
      console.log('Cleaning up WebSocket listeners...');
      webSocketClient.off('connect');
      webSocketClient.off('disconnect');
      
      // Remove all custom event handlers
      for (const eventName in eventHandlers) {
        if (Object.hasOwnProperty.call(eventHandlers, eventName)) {
          webSocketClient.off(eventName);
        }
      }
      
      // We might not want to disconnect globally here if other components use it.
      // webSocketClient.disconnect(); 
    };
  }, [eventHandlers]); // Rerun effect if handlers change

  const emit = useCallback((eventName, data) => {
    webSocketClient.emit(eventName, data);
  }, []);

  return { isConnected, emit };
};

export default useWebSocket;