import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TailTradeHomePage from './Components/HomePage.jsx';
import LoginRegister from './Components/LoginRegister.jsx';
import Profile from './Components/Profile.jsx';
import Menu from './Components/Menu.jsx';
import ListingDetail from './Components/ListingDetails.jsx'; // Corrected filename casing if needed
import CreateListing from './Components/CreateListing.jsx';
import MessagingPage from './Components/MessagingPage.jsx'; // Added .jsx for consistency
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TailTradeHomePage />} />
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/list-pet" element={<CreateListing />} /> {/* Assuming this is for creating listings */}
        <Route path="/Menu" element={<Menu />} />
        <Route path="/listing/:listingType/:listingId" element={<ListingDetail />} />
      
        <Route path="/messagingPage" element={<MessagingPage />} />

        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}
export default App;