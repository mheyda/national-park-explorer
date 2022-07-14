import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllParks, fetchFirstIntervalParks, selectInterval } from '../features/explore/exploreSlice';
import { selectTokens } from '../features/user/userSlice';
import Explore from '../features/explore/Explore.js';
import Authenticate from '../features/user/authenticate/Authenticate';
import ExplorePark from '../features/explore/explorePark/ExplorePark';
import Favorites from '../features/favorites/Favorites';
import User from '../features/user/User';
import NavBar from './navBar/NavBar';
import NotFound from '../features/notFound/NotFound';
import { refreshTokens, selectRefreshTokensStatus } from '../features/user/userSlice';
import './App.css';

function App() {

  const dispatch = useDispatch();
  const interval = useSelector(selectInterval);
  const tokens = useSelector(selectTokens);
  const refreshTokensStatus = useSelector(selectRefreshTokensStatus);

  // Refresh JWT tokens on refresh
  useEffect(() => {
    dispatch(refreshTokens({prevTokens: tokens}));
  }, [dispatch]);

  // Wait until JWT tokens have been refreshed, then get all parks for map view and get first set of parks of list view
  useEffect(() => {
    if (refreshTokensStatus === 'succeeded' || refreshTokensStatus === 'failed') {
      dispatch(fetchAllParks({tokens: tokens}));
      dispatch(fetchFirstIntervalParks({limit: interval, tokens: tokens}));
    }
  }, [dispatch, interval, tokens, refreshTokensStatus])

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route index element={<Explore />} />
        <Route path='/' element={<Explore />} />
        <Route path="/user" element={<User />} />
        <Route path="/user/:format" element={<Authenticate />} />
        <Route path="/:parkFullName/:parkCode" element={<ExplorePark />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
