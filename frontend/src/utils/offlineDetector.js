/**
 * Offline Detection Utility
 * Detects online/offline status and provides callbacks
 */

class OfflineDetector {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = [];
    
    // Listen to online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Also check connection status
    if (navigator.connection) {
      navigator.connection.addEventListener('change', this.handleConnectionChange.bind(this));
    }
  }

  handleOnline = () => {
    console.log('[Offline Detector] Device is online');
    this.isOnline = true;
    this.notifyListeners(true);
  };

  handleOffline = () => {
    console.log('[Offline Detector] Device is offline');
    this.isOnline = false;
    this.notifyListeners(false);
  };

  handleConnectionChange = () => {
    const connection = navigator.connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink;
      console.log('[Offline Detector] Connection changed:', { effectiveType, downlink });
    }
  };

  notifyListeners = (isOnline) => {
    this.listeners.forEach((listener) => {
      try {
        listener(isOnline);
      } catch (error) {
        console.error('[Offline Detector] Error in listener:', error);
      }
    });
  };

  /**
   * Add a listener for online/offline status changes
   */
  onStatusChange = (callback) => {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  };

  /**
   * Check if device is currently online
   */
  checkOnline = () => {
    return navigator.onLine;
  };

  /**
   * Get connection information if available
   */
  getConnectionInfo = () => {
    if (navigator.connection) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData,
      };
    }
    return null;
  };
}

// Create singleton instance
const offlineDetector = new OfflineDetector();

export default offlineDetector;

