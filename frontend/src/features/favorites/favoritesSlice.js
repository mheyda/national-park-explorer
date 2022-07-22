import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { makeRequest } from '../../makeRequest';


export const getFavorites = createAsyncThunk('favorites/getFavorites', async (options, { rejectWithValue }) => {
  // Make request to get user's favorites.

  const favorites = await makeRequest({ 
      urlExtension: 'user/favorites/', 
      method: 'GET', 
      body: null,
      authRequired: true,
  });

  if (favorites.error) {
  } else {
    console.log(favorites.data)
    return favorites.data;
  }
})

export const toggleFavorite = createAsyncThunk('favorites/toggleFavorite', async (options, { rejectWithValue }) => {
  // Make request to toggle the "favorite" status of a park for a user.
  const { id } = options;

  const updatedFavorites = await makeRequest({ 
    urlExtension: 'user/favorites/', 
    method: 'POST', 
    body: id,
    authRequired: true,
  });

  if (updatedFavorites.error) {
    return rejectWithValue(updatedFavorites.error);
  } else {
    return updatedFavorites.data;
  }
})

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    favorites: [],
    favoritesStatus: 'idle',
    toggleStatus: 'idle',
  },
  reducers: {
    setToggleStatus: (state, action) => {
      state.toggleStatus = action.payload;
    }
  },
  extraReducers(builder) {
    builder
    .addCase(getFavorites.pending, (state) => {
      state.toggleStatus = 'loading';
      state.error = null;
    })
    .addCase(getFavorites.fulfilled, (state, action) => {
      state.toggleStatus = 'succeeded'
      state.favorites = action.payload;
      console.log(action.payload)
    })
    .addCase(getFavorites.rejected, (state, action) => {
      state.toggleStatus = 'failed';
      state.error = action.error.message;
    })
    .addCase(toggleFavorite.pending, (state) => {
      state.toggleStatus = 'loading';
      state.error = null;
    })
    .addCase(toggleFavorite.fulfilled, (state, action) => {
      state.toggleStatus = 'succeeded'
      state.favorites = action.payload;
    })
    .addCase(toggleFavorite.rejected, (state, action) => {
      state.toggleStatus = 'failed';
      state.error = action.error.message;
    })
  },
});

export const { setToggleStatus } = favoritesSlice.actions;

export const selectFavorites = (state) => state.favorites.favorites;
export const selectFavoritesStatus = (state) => state.favorites.favoritesStatus;
export const selectToggleStatus = (state) => state.favorites.toggleStatus;

export default favoritesSlice.reducer;
