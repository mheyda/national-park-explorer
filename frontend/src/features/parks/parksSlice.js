import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';


export const fetchIntervalParks = createAsyncThunk('parks/fetchIntervalParks', async (options) => {
  const { start, limit, sort, stateCode } = options;
  //const response = await fetch(`https://mheyda-server.herokuapp.com/getParks?start=${start}&limit=${limit}&sort=${sort}&stateCode=${stateCode}`);
  const response = await fetch(`http://127.0.0.1:8000/getParks?start=${start}&limit=${limit}&sort=${sort}&stateCode=${stateCode}`);
  const json = await response.json();
  const data = await json.data;
  return data;
})

export const fetchAllParks = createAsyncThunk('parks/fetchAllParks', async (options) => {
  const { stateCode } = options;
  //const response = await fetch("https://mheyda-server.herokuapp.com/getParks?start=10&limit=2&sort=fullName&stateCode=");
  const response = await fetch(`http://127.0.0.1:8000/getParks?start=0&limit=500&sort=&stateCode=${stateCode}`);
  const json = await response.json();
  const data = await json.data;
  return data;
})


export const parksSlice = createSlice({
  name: 'parks',
  initialState: {
    listParks: [],
    mapParks: [],
    filteredParks: [],
    sort: 'Alphabetical (A-Z)',
    filter: {
      designation: 'All',
      stateCode: '',
    },
    view: 'list',
    status: 'idle',
    error: null
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
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
      .addCase(fetchIntervalParks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchIntervalParks.fulfilled, (state, action) => {
        try {
          state.status = 'succeeded'
          // Add fetched parks to state
          state.allParks = action.payload;
          state.filteredParks = action.payload;
          action.payload.map(park => state.listParks.push(park));
        } catch(e) {
          alert("Error: " + e);
        }
      })
      .addCase(fetchIntervalParks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchAllParks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllParks.fulfilled, (state, action) => {
        try {
          state.status = 'succeeded'
          // Add fetched parks to state
          state.mapParks = action.payload;
          console.log('fetched')
          console.log(action)
        } catch(e) {
          alert("Error: " + e);
        }
      })
      .addCase(fetchAllParks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
  },
});

export const { setParks, filterParks, sortParks, changeView } = parksSlice.actions;

export const selectAllParks = (state) => state.parks.allParks;
export const selectMapParks = (state) => state.parks.mapParks;
export const selectFilteredParks = (state) => state.parks.filteredParks;
export const selectListParks = (state) => state.parks.listParks;
export const selectSort = (state) => state.parks.sort;
export const selectFilter = (state) => state.parks.filter;
export const selectView = (state) => state.parks.view;

export default parksSlice.reducer;
