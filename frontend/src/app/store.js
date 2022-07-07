import { configureStore } from '@reduxjs/toolkit';
import exploreReducer from '../features/explore/exploreSlice';
import weatherReducer from '../features/weather/weatherSlice';

export const store = configureStore({
  reducer: {
    explore: exploreReducer,
    weather: weatherReducer
  },
});
