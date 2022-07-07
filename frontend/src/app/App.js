import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllParks, fetchFirstIntervalParks, selectInterval } from '../features/explore/exploreSlice';
import Explore from '../features/explore/Explore.js';
import Authenticate from '../features/user/authenticate/Authenticate';
import ExplorePark from '../features/explore/explorePark/ExplorePark.js';
import Favorites from '../features/favorites/Favorites';
import NavBar from './navBar/NavBar.js';
import NotFound from '../features/notFound/NotFound.js';
import './App.css';

function App() {

  const dispatch = useDispatch();
  const interval = useSelector(selectInterval);

  // Get all parks for map view and get first set of parks of list view
  useEffect(() => {
      dispatch(fetchAllParks());
      dispatch(fetchFirstIntervalParks({limit: interval}));
  }, [dispatch, interval])

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route index element={<Explore />} />
        <Route path='/' element={<Explore />} />
        <Route path="/user/:format" element={<Authenticate />} />
        <Route path="/:parkFullName/:parkCode" element={<ExplorePark />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
