import React from 'react'; 
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TailTradeHomePage from './Components/HomePage.jsx';
import LoginRegister from './Components/LoginRegister.jsx';
import Profile from './Components/Profile.jsx'; 
import ListPet from './Components/ListPet.jsx';
import './App.css';




function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<TailTradeHomePage />} />
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/list-pet" element={<ListPet />} />

      </Routes>
    </Router>
  );
}

export default App;