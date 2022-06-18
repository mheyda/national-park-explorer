import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';


export const fetchParks = createAsyncThunk('parks/fetchParks', async () => {
  const response = await fetch("https://mheyda-server.herokuapp.com/getParks");
  const json = await response.json();
  const data = await json.data;
  return data;
})


export const parksSlice = createSlice({
  name: 'parks',
  initialState: {
    allParks: [],
    filteredParks: [],
    sort: 'Alphabetical (A-Z)',
    filter: 'All',
    view: 'list',
    status: 'idle',
    error: null
  },
  reducers: {
    setParks: (state, action) => {
      state.allParks = action.payload;
      state.filteredParks = action.payload;
    },
    filterParks: (state, action) => {
      if (action.payload === 'All') {
        state.filteredParks = state.allParks;
      } else {
        state.filteredParks = state.allParks.filter(park => park.fullName.includes(action.payload));
      }
      state.filter = action.payload;
    },
    sortParks: (state, action) => {
      state.sort = action.payload;
      switch (action.payload) {
        case 'Alphabetical (A-Z)':
          state.filteredParks = state.filteredParks.sort((a, b) => a.fullName.localeCompare(b.fullName));
          break;
        case 'Reverse Alphabetical (Z-A)':
          state.filteredParks = state.filteredParks.sort((a, b) => b.fullName.localeCompare(a.fullName));
          break;
        default:
          return;
      }
    },
    changeView: (state, action) => {
      state.view = action.payload.view;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchParks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchParks.fulfilled, (state, action) => {
        try {
          state.status = 'succeeded'
          // Add fetched parks to state
          state.allParks = action.payload;
          state.filteredParks = action.payload;
        } catch(e) {
          alert("Error: " + e);
        }
      })
      .addCase(fetchParks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
  },
});

export const { setParks, filterParks, sortParks, changeView } = parksSlice.actions;

export const selectAllParks = (state) => state.parks.allParks;
export const selectFilteredParks = (state) => state.parks.filteredParks;
export const selectSort = (state) => state.parks.sort;
export const selectFilter = (state) => state.parks.filter;
export const selectView = (state) => state.parks.view;

export default parksSlice.reducer;
