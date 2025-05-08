
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TailTradeHomePage from './Components/HomePage.jsx';
import LoginRegister from './Components/LoginRegister.jsx';
import Profile from './Components/Profile.jsx';
import Menu from './Components/Menu.jsx';
import ListingDetail from './Components/ListingDetail.jsx'; 
import CreateListing from './Components/CreateListing.jsx'; 
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TailTradeHomePage />} />
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/list-pet" element={<CreateListing />} />
        <Route path="/Menu" element={<Menu />} />
        <Route path="/listing/:listingType/:listingId" element={<ListingDetail />} />
      </Routes>
    </Router>
  );
}
export default App;