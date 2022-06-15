import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Explore from './routes/explore/Explore.js';
import MyParks from './routes/myParks/MyParks.js';
import Park from './routes/park/Park.js';
import NavBar from './components/navBar/NavBar.js';
import Home from './routes/home/Home';
import NoMatch from './routes/noMatch/NoMatch';

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        {/* For future use when more nav buttons are needed
        <Route index element={<Home />} />
        <Route path='/' element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="explore/:parkFullName/:parkCode" element={<Park />} />
        <Route path='my-parks' element={<MyParks />} />
        <Route path="*" element={<NoMatch />} />
      
        */}
        <Route index element={<Explore />} />
        <Route path='/' element={<Explore />} />
        <Route path=":parkFullName/:parkCode" element={<Park />} />
        <Route path='my-parks' element={<MyParks />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
