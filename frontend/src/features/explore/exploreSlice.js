import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchFirstIntervalParks = createAsyncThunk('parks/fetchIntervalParks', async (options) => {
  const { limit } = options;
  const response = await fetch(`https://mheyda-server.herokuapp.com/getParks?start=0&limit=${limit}&sort=fullName&stateCode=`);
  // For development
  //const response = await fetch(`http://127.0.0.1:8000/getParks?start=${start}&limit=${limit}&sort=${sort}&stateCode=${stateCode}`);
  const json = await response.json();
  const data = await json.data;
  return data;
})

export const fetchAllParks = createAsyncThunk('parks/fetchAllParks', async () => {
  const response = await fetch(`https://mheyda-server.herokuapp.com/getParks?start=0&limit=500&sort=fullName&stateCode=`);
  // For development
  //const response = await fetch(`http://127.0.0.1:8000/getParks?start=0&limit=500&sort=fullName&stateCode=`);
  const json = await response.json();
  const data = await json.data;
  return data;
})

export const exploreSlice = createSlice({
  name: 'explore',
  initialState: {
    allParks: [],
    listParks: [],
    mapParks: [],
    interval: 12,
    sort: 'Alphabetical (A-Z)',
    filter: {
      designations: [],
      stateCodes: [],
    },
    query: '',
    view: 'list',
    allParksStatus: 'idle',
    intervalParksStatus: 'idle',
    error: null
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    setView: (state, action) => {
      state.view = action.payload.view;
    },
    filterParks: (state) => {
      // Reinitialize parks
      state.mapParks = state.allParks;
      state.listParks = state.allParks;

      // Filter by query
      if (state.query) {
        const query = state.query;
        let tokens = query.toLowerCase().split(' ').filter(token => token.trim() !== ''); // Tokenize the query
        let queryRegex = new RegExp(tokens.join('|'), 'gim'); // Create regex
        let parkStrings = []; // Create park strings to compare regex to... park properties that are used are specified
        state.allParks.map((park, index) => {
          parkStrings[index] = { id: park.id, string: '' };
          for (let key in park) {
            if (key === 'fullName' || key === 'description' || key === 'activities') { // Park properties to use for the search
              if (park.hasOwnProperty(key) && park[key] !== '') {
                parkStrings[index].string += park[key].toString().toLowerCase().trim() + ' ';
              }
            }
          }
          return true;
        });
        const matches = parkStrings.filter(parkString => parkString.string.match(queryRegex)); // Park string objects that the search matched
        state.listParks = matches.map(match => state.allParks.find(park => park.id === match.id));
        state.mapParks = matches.map(match => state.allParks.find(park => park.id === match.id));
      }

      // Filter by state codes
      if (state.filter.stateCodes.length > 0) {
        state.mapParks = state.mapParks.filter(park => park.states.split(',').some(element => state.filter.stateCodes.includes(element)));
        state.listParks = state.listParks.filter(park => park.states.split(',').some(element => state.filter.stateCodes.includes(element)));
      }

      // Filter by designation
      if (state.filter.designations.length > 0) {
        state.mapParks = state.mapParks.filter(park => state.filter.designations.some(designation => park.designation.includes(designation)));
        state.listParks = state.listParks.filter(park => state.filter.designations.some(designation => park.designation.includes(designation)));
      }

      // Sort parks
      switch(state.sort) {
        case 'Alphabetical (A-Z)':
          state.listParks = state.listParks.sort((a, b) => a.fullName.localeCompare(b.fullName));
          break;
        case 'Reverse Alphabetical (Z-A)':
          state.listParks = state.listParks.sort((a, b) => b.fullName.localeCompare(a.fullName));
          break;
        default:
          return;
      }

      // Only display x-number of parks at a time in list view
      state.listParks = state.listParks.slice(0, state.interval);
    },
    getNextParks: (state) => {
      state.mapParks.slice(state.listParks.length, state.listParks.length + state.interval).map(park => state.listParks.push(park))
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchFirstIntervalParks.pending, (state) => {
        state.intervalParksStatus = 'loading';
      })
      .addCase(fetchFirstIntervalParks.fulfilled, (state, action) => {
        try {
          state.intervalParksStatus = 'succeeded'
          // Add fetched parks to list view
          state.listParks = action.payload;
        } catch(e) {
          console.log("Error: " + e);
        }
      })
      .addCase(fetchFirstIntervalParks.rejected, (state, action) => {
        state.intervalParksStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchAllParks.pending, (state) => {
        state.allParksStatus = 'loading';
      })
      .addCase(fetchAllParks.fulfilled, (state, action) => {
        try {
          state.allParksStatus = 'succeeded'
          // Add fetched parks to state depending on the current designation filter
          state.allParks = action.payload;
          state.mapParks = action.payload;
        } catch(e) {
          alert("Error: " + e);
        }
      })
      .addCase(fetchAllParks.rejected, (state, action) => {
        state.allParksStatus = 'failed';
        state.error = action.error.message;
      })
  },
});

export const { setFilter, setSort, setQuery, setView, filterParks, getNextParks } = exploreSlice.actions;

export const selectAllParks = (state) => state.explore.allParks;
export const selectMapParks = (state) => state.explore.mapParks;
export const selectListParks = (state) => state.explore.listParks;
export const selectInterval = (state) => state.explore.interval;
export const selectSort = (state) => state.explore.sort;
export const selectFilter = (state) => state.explore.filter;
export const selectQuery = (state) => state.explore.query;
export const selectView = (state) => state.explore.view;

export default exploreSlice.reducer;
