/**
 * Offline Storage Utility
 * Handles saving and loading dashboard state to localStorage
 */

const STORAGE_KEYS = {
  DASHBOARD_STATE: 'dashboard_state',
  SENSOR_DATA: 'sensor_data',
  DASHBOARD_CONFIG: 'dashboard_config',
  LAST_UPDATE: 'last_update',
};

/**
 * Save dashboard state to localStorage
 */
export const saveDashboardState = (state) => {
  try {
    const dataToSave = {
      ...state,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_STATE, JSON.stringify(dataToSave));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
    console.log('[Offline Storage] Dashboard state saved');
    return true;
  } catch (error) {
    console.error('[Offline Storage] Error saving state:', error);
    return false;
  }
};

/**
 * Load dashboard state from localStorage
 */
export const loadDashboardState = () => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEYS.DASHBOARD_STATE);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      console.log('[Offline Storage] Dashboard state loaded');
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('[Offline Storage] Error loading state:', error);
    return null;
  }
};

/**
 * Save sensor data to localStorage
 */
export const saveSensorData = (sensorData) => {
  try {
    const dataToSave = {
      ...sensorData,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.SENSOR_DATA, JSON.stringify(dataToSave));
    console.log('[Offline Storage] Sensor data saved');
    return true;
  } catch (error) {
    console.error('[Offline Storage] Error saving sensor data:', error);
    return false;
  }
};

/**
 * Load sensor data from localStorage
 */
export const loadSensorData = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEYS.SENSOR_DATA);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      console.log('[Offline Storage] Sensor data loaded');
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('[Offline Storage] Error loading sensor data:', error);
    return null;
  }
};

/**
 * Save dashboard configuration
 */
export const saveDashboardConfig = (config) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_CONFIG, JSON.stringify(config));
    console.log('[Offline Storage] Dashboard config saved');
    return true;
  } catch (error) {
    console.error('[Offline Storage] Error saving config:', error);
    return false;
  }
};

/**
 * Load dashboard configuration
 */
export const loadDashboardConfig = () => {
  try {
    const savedConfig = localStorage.getItem(STORAGE_KEYS.DASHBOARD_CONFIG);
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    return null;
  } catch (error) {
    console.error('[Offline Storage] Error loading config:', error);
    return null;
  }
};

/**
 * Clear all saved data
 */
export const clearOfflineData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    console.log('[Offline Storage] All data cleared');
    return true;
  } catch (error) {
    console.error('[Offline Storage] Error clearing data:', error);
    return false;
  }
};

/**
 * Get last update time
 */
export const getLastUpdate = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
  } catch (error) {
    return null;
  }
};

