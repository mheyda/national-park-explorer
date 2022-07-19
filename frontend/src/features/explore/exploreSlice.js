import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';


export const fetchFirstIntervalParks = createAsyncThunk('parks/fetchIntervalParks', async (options) => {
  const { limit } = options;
  try {
    //const response = await fetch(`https://mheyda-server.herokuapp.com/getParks?start=0&limit=${limit}&sort=fullName&stateCode=`);
    // For development
    const response = await fetch(`http://127.0.0.1:8000/getParks?start=0&limit=${limit}&sort=fullName&stateCode=`, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });

    if (response.ok) {
      const json = await response.json();
      const data = await json.data;
      return data;
    }

    throw Error(response.statusText);
  
  } catch (error) {
    console.log(error);
  }
})

export const fetchAllParks = createAsyncThunk('parks/fetchAllParks', async () => {
  try {
    //const response = await fetch(`https://mheyda-server.herokuapp.com/getParks?start=0&limit=500&sort=fullName&stateCode=`);
    // For development
    const response = await fetch(`http://127.0.0.1:8000/getParks?start=0&limit=500&sort=fullName&stateCode=`, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });

    if (response.ok) {
      const json = await response.json();
      const data = await json.data;
      return data;
    }
    
    throw Error(response.statusText);

  } catch (error) {
    console.log(error);
  }
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
    error: null,
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
            if (key === 'fullName' || key === 'description' || key === 'activities' || key === 'topics') { // Park properties to use for the search
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
        state.error = null;
      })
      .addCase(fetchFirstIntervalParks.fulfilled, (state, action) => {
        state.intervalParksStatus = 'succeeded'
        // Add fetched parks to list view
        state.listParks = action.payload;
        state.error = null;
      })
      .addCase(fetchFirstIntervalParks.rejected, (state, action) => {
        state.intervalParksStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchAllParks.pending, (state) => {
        state.allParksStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchAllParks.fulfilled, (state, action) => {
        state.allParksStatus = 'succeeded'
        // Add fetched parks to state depending on the current designation filter
        state.allParks = action.payload;
        state.mapParks = action.payload;
        state.error = null;
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
export const selectError = (state) => state.explore.error;
export const selectFilter = (state) => state.explore.filter;
export const selectQuery = (state) => state.explore.query;
export const selectView = (state) => state.explore.view;

export default exploreSlice.reducer;
