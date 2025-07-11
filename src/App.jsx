import { Routes, Route, Navigate } from 'react-router-dom'; // <--- REMOVE Router import here
import TailTradeHomePage from './Components/HomePage.jsx';
import LoginRegister from './Components/LoginRegister.jsx';
import Profile from './Components/Profile.jsx';
import Menu from './Components/Menu.jsx';
import ListingDetail from './Components/ListingDetails.jsx';
import CreateListing from './Components/CreateListing.jsx';
import MessagingPage from './Components/MessagingPage.jsx';
import ProtectedRoute from './Components/ProtectedRoute.jsx';
import Dashboard from './Components/Dashboard.jsx';
import LegalPoliciesPage from './Components/LegalPoliciesPage.jsx';
import './App.css';

function App() {
  return (
    // <Router> <--- REMOVE Router tags from here
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginRegister />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<TailTradeHomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/list-pet" element={<CreateListing />} />
          <Route path="/Menu" element={<Menu />} />
          <Route path="/listing/:listingType/:listingId" element={<ListingDetail />} />
          <Route path="/messagingPage" element={<MessagingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/LegalPoliciesPage" element={<LegalPoliciesPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    // </Router> <--- REMOVE Router tags from here
  );
}

export default App;