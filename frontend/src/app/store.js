// src/app/store.js

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import all your reducers
import authReducer from '../features/auth/authSlice';
import rtmReducer from '../features/rtm/rtmSlice';
import pdmReducer from '../features/pdm/pdmSlice';
import rtoReducer from '../features/rto/rtoSlice';
import uiReducer from '../features/ui/uiSlice';
import controlReducer from '../features/control/controlSlice';
import checklistReducer from '../features/checklist/checklistSlice';
import analysisReducer from '../features/analysis/analysisSlice';
import threeDReducer from '../features/threeD/threeDSlice';

// Combine all reducers into a single root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  rtm: rtmReducer,
  pdm: pdmReducer,
  rto: rtoReducer,
  ui: uiReducer,
  control: controlReducer,
  checklist: checklistReducer,
  analysis: analysisReducer,
  threeD: threeDReducer,
});

// Configuration for redux-persist
const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PURGE',
          'rtm/addDataPoint',
          'rtm/addAlert',
          'alarms/markAsAnomaly',
          'analysis/setLargeDataSet',
        ],
      },
    }),
});

export const persistor = persistStore(store);