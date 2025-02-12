
// export const persistor = persistStore(store)


import { configureStore, combineReducers } from '@reduxjs/toolkit'
import userReducer from './user/userSlice'
import themeReducer from './theme/themeSlice'
import { persistReducer, persistStore , createTransform } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

// Create a transform to handle user state cleanup
const userTransform = createTransform(
  // transform state on its way to being serialized and persisted
  (inboundState) => {
    return inboundState;
  },
  // transform state being rehydrated
  (outboundState) => {
    // If user is logged out or deleted, ensure clean state
    if (!outboundState?.currentUser) {
      return {
        currentUser: null,
        error: null,
        loading: false,
      };
    }
    return outboundState;
  },
  // Only apply to user reducer
  { whitelist: ['user'] }
);

// Create the root reducer with a reset action
const appReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
});

const rootReducer = (state, action) => {
  // When a reset action is dispatched, reset all state except theme
  if (action.type === 'RESET_STORE') {
    const { theme } = state;
    state = { theme };
  }
  return appReducer(state, action);
};

// Configure persist with transforms
const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  transforms: [userTransform],
  blacklist: ['_persist'], // Prevent persisting the persist state itself
};

// Create the persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store with the persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Create the persistor
export const persistor = persistStore(store);

// Export a reset action creator
export const resetStore = () => ({
  type: 'RESET_STORE'
});

// Helper function to purge store data
export const purgeStore = async () => {
  await persistor.purge();
  store.dispatch(resetStore());
};