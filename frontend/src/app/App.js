import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { selectTokens } from '../features/user/userSlice';
import Explore from '../features/explore/Explore.js';
import Authenticate from '../features/user/authenticate/Authenticate';
import ExplorePark from '../features/explore/explorePark/ExplorePark';
import Favorites from '../features/favorites/Favorites';
import User from '../features/user/User';
import NavBar from './navBar/NavBar';
import NotFound from '../features/notFound/NotFound';
import { refreshTokens } from '../features/user/userSlice';
import './App.css';

function App() {

  const dispatch = useDispatch();
  const tokens = useSelector(selectTokens);

  // Refresh JWT tokens on page load if user has signed in already
  useEffect(() => {
    if (tokens.refresh) {
      dispatch(refreshTokens({prevTokens: tokens}));
    }
  }, [dispatch]);

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
