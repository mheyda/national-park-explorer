import { createSlice } from '@reduxjs/toolkit';


export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    favorites: null
  },
  reducers: {
    setFavorites: (state, action) => {
        state.favorites = action.payload;
        console.log(action.payload)
    }
  },
});

export const { setFavorites } = favoritesSlice.actions;

export const selectFavorites = (state) => state.favorites.favorites;

export default favoritesSlice.reducer;
