import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAllParks,
  fetchFirstIntervalParks,
  filterParks,
  selectAllParks, 
  selectInterval,
  selectQuery, 
  selectSort, 
  selectFilter, 
} from '../features/explore/exploreSlice.js';
import Explore from '../features/explore/Explore.js';
import Authenticate from '../features/user/authenticate/Authenticate';
import ExplorePark from '../features/explore/explorePark/ExplorePark';
import Favorites from '../features/favorites/Favorites';
import User from '../features/user/User';
import NavBar from './navBar/NavBar';
import NotFound from '../features/notFound/NotFound';
import './App.css';

function App() {

  const dispatch = useDispatch();
  const allParks = useSelector(selectAllParks);
  const interval = useSelector(selectInterval);
  const filter = useSelector(selectFilter);
  const query = useSelector(selectQuery);
  const sort = useSelector(selectSort);

  // Get all parks for map view and get first set of parks of list view
  useEffect(() => {
    dispatch(fetchAllParks());
    dispatch(fetchFirstIntervalParks({limit: interval}));
  }, [dispatch, interval])

  useEffect(() => {
      if (allParks && allParks.length > 0) {
          dispatch(filterParks());
      }
  }, [filter, sort, query, dispatch, allParks])


  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route index element={<Explore />} />
        <Route path='/' element={<Explore />} />
        <Route path="/user" element={<User />} />
        <Route path="/user/:format" element={<Authenticate />} />
        <Route path="/user/favorites" element={<Favorites />} />
        <Route path="/:parkFullName/:parkCode" element={<ExplorePark />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
