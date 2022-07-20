import { configureStore } from '@reduxjs/toolkit';
import exploreReducer from '../features/explore/exploreSlice';
import weatherReducer from '../features/weather/weatherSlice';
import userReducer from '../features/user/userSlice';
import favoritesReducer from '../features/favorites/favoritesSlice';

export const store = configureStore({
  reducer: {
    explore: exploreReducer,
    weather: weatherReducer,
    user: userReducer,
    favorites: favoritesReducer,
  },
});
