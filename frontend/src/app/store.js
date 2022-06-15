import { configureStore } from '@reduxjs/toolkit';
import parksReducer from '../features/parks/parksSlice';
import weatherReducer from '../features/weather/weatherSlice';

export const store = configureStore({
  reducer: {
    parks: parksReducer,
    weather: weatherReducer
  },
});
