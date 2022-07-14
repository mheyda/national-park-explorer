import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const refreshTokens = createAsyncThunk('user/refreshTokens', async (options) => {
    const { prevTokens } = options;
    const response = await fetch('http://127.0.0.1:8000/token/refresh/', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Authorization': `JWT ${prevTokens.access}`,
            'Content-Type': 'application/json',
            'accept': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(prevTokens),
    });
    
    if (!response.ok) {
        console.log('Error: ' + response.status + ' ' + response.statusText);
        throw Error(response.statusText);
    }
    const newTokens = await response.json(); // JWT Tokens object
    return newTokens;
})


export const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: localStorage.getItem('username') ? JSON.parse(localStorage.getItem('username')) : '',
    tokens: localStorage.getItem('tokens') ? JSON.parse(localStorage.getItem('tokens')) : {access: null, refresh: null},
    refreshTokensStatus: 'idle',
    error: null,
  },
  reducers: {
    setTokens: (state, action) => {
      state.tokens = action.payload;
      localStorage.setItem('tokens', JSON.stringify(action.payload));
    },
    setAuthUsername: (state, action) => {
      state.username = action.payload;
      localStorage.setItem('username', JSON.stringify(action.payload));
    }
  },
  extraReducers(builder) {
    builder
      .addCase(refreshTokens.pending, (state) => {
        state.refreshTokensStatus = 'loading';
      })
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.refreshTokensStatus = 'succeeded'
        // Add fetched parks to list view
        state.tokens = action.payload;
      })
      .addCase(refreshTokens.rejected, (state, action) => {
        state.refreshTokensStatus = 'failed';
        state.error = action.error.message;
      })
  },
});

export const { setTokens, setAuthUsername } = userSlice.actions;

export const selectTokens = (state) => state.user.tokens;
export const selectUsername = (state) => state.user.username;
export const selectRefreshTokensStatus = (state) => state.user.refreshTokensStatus;

export default userSlice.reducer;
