import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ClipboardList,
  Flag,
  DollarSign,
  ChevronRight,
  LayoutDashboard,
  Settings,
  LogOut,
  Trash2,
  Edit,
  AlertTriangle,
  Check,
  X,
  Home // Added Home icon
} from 'lucide-react';
import { useAuth } from '../AuthContext'; // <--- IMPORT useAuth
import config from '../config'; // <--- IMPORT THE CONFIG FILE
import axios from 'axios'; // <--- IMPORT AXIOS FOR API CALLS

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('users');
  // const [currentUser, setCurrentUser] = useState(null); // No longer needed, use `user` from AuthContext
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  // Get user and authLoading from AuthContext
  const { user, authLoading, logout } = useAuth(); // <--- USE user, authLoading, and logout from AuthContext

  // Map AuthContext's 'user' to local 'currentUser' for existing logic
  const currentUser = user;

  // Check if user is logged in and is an admin
  useEffect(() => {
    if (authLoading) {
      // Still loading auth state, show loading spinner
      setLoading(true);
      return;
    }

    if (currentUser && currentUser.role === 'admin') {
      // User is an admin, proceed to load data
      loadSectionData(activeSection);
    } else {
      // Not logged in or not an admin, redirect
      navigate('/'); // Redirect non-admin users or unauthenticated users to home
    }
  }, [navigate, currentUser, authLoading]); // Depend on currentUser and authLoading

  // When active section changes (and user is admin), load relevant data
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin' && !authLoading) {
      loadSectionData(activeSection);
    }
  }, [activeSection, currentUser, authLoading]); // Added authLoading dependency

  // Function to fetch data based on active section
  const loadSectionData = async (section) => {
    setLoading(true);
    setMessage({ text: '', type: '' }); // Clear previous messages
    try {
      let response;
      let data;
      let url;

      switch (section) {
        case 'users':
          url = `${config.API_BASE_URL}/${config.endpoints.GET_ALL_USERS}`;
          response = await axios.get(url, { timeout: 15000 });
          data = response.data;
          if (data.success) {
            setUsers(data.users);
          } else {
            setMessage({ text: data.message || 'Failed to load users', type: 'error' });
          }
          break;

        case 'listings':
          url = `${config.API_BASE_URL}/${config.endpoints.GET_ALL_LISTINGS}`;
          response = await axios.get(url, { timeout: 15000 });
          data = response.data;
          if (data.success) {
            setListings(data.listings);
          } else {
            setMessage({ text: data.message || 'Failed to load listings', type: 'error' });
          }
          break;

        case 'flagged':
          url = `${config.API_BASE_URL}/${config.endpoints.GET_FLAGGED_CONTENT}`;
          response = await axios.get(url, { timeout: 15000 });
          data = response.data;
          if (data.success) {
            setFlaggedContent(data.flagged);
          } else {
            setMessage({ text: data.message || 'Failed to load flagged content', type: 'error' });
          }
          break;

        case 'sold':
          url = `${config.API_BASE_URL}/${config.endpoints.GET_SOLD_ITEMS}`;
          response = await axios.get(url, { timeout: 15000 });
          data = response.data;
          if (data.success) {
            setSoldItems(data.sold);
          } else {
            setMessage({ text: soldData.message || 'Failed to load sold items', type: 'error' });
          }
          break;

        default:
          setMessage({ text: 'Unknown section selected.', type: 'error' });
          break;
      }
    } catch (error) {
      let errorMessage = `Error loading ${section} data: ${error.message}`;
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = `Request timed out while loading ${section}.`;
        } else if (error.response) {
          errorMessage = error.response.data.message || `Server error: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = 'Network error or server did not respond.';
        }
      }
      console.error(`Error loading ${section} data:`, error);
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Custom confirmation modal (replace window.confirm)
  const showConfirmModal = (messageText, onConfirm) => {
    // In a real app, you'd render a modal here.
    // For now, we'll use a simple alert/confirm for quick testing.
    // Replace this with a proper modal UI for production.
    if (window.confirm(messageText)) {
      onConfirm();
    }
  };


  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    showConfirmModal('Are you sure you want to delete this user? This action cannot be undone.', async () => {
      try {
        const url = `${config.API_BASE_URL}/${config.endpoints.DELETE_USER}`;
        const response = await axios.post(url, { userId }, { timeout: 10000 });
        const result = response.data;

        if (result.success) {
          setMessage({ text: 'User deleted successfully', type: 'success' });
          setUsers(users.filter(user => user.id !== userId));
        } else {
          setMessage({ text: result.message || 'Failed to delete user', type: 'error' });
        }
      } catch (error) {
        let errorMessage = `Error deleting user: ${error.message}`;
        if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        }
        console.error('Error deleting user:', error);
        setMessage({ text: errorMessage, type: 'error' });
      }
    });
  };

  // Handle listing management
  const handleManageListing = async (listingId, listingType, action) => {
    const confirmMessage = action === 'delete' ? 'delete this listing' : (action === 'revert' ? 'revert this listing to active' : 'mark this listing as sold');
    showConfirmModal(`Are you sure you want to ${confirmMessage}?`, async () => {
      try {
        let endpointPath;
        let body = { listingId, listingType };

        if (action === 'delete') {
          endpointPath = config.endpoints.DELETE_LISTING;
        } else { // 'markSold' or 'revert'
          endpointPath = config.endpoints.UPDATE_LISTING_STATUS;
          if (action === 'markSold') {
            body.status = 'sold';
          } else if (action === 'revert') {
            body.status = 'available';
          }
        }
        const url = `${config.API_BASE_URL}/${endpointPath}`;

        const response = await axios.post(url, body, { timeout: 10000 });
        const result = response.data;

        if (result.success) {
          setMessage({ text: `Listing ${action === 'delete' ? 'deleted' : (action === 'revert' ? 'reverted' : 'updated')} successfully`, type: 'success' });
          loadSectionData(activeSection);
        } else {
          setMessage({ text: result.message || `Failed to ${action} listing`, type: 'error' });
        }
      } catch (error) {
        let errorMessage = `Error ${action} listing: ${error.message}`;
        if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        }
        console.error(`Error ${action} listing:`, error);
        setMessage({ text: errorMessage, type: 'error' });
      }
    });
  };


  // Handle flagged content actions
  const handleFlaggedAction = async (itemId, itemType, action) => {
    const confirmMessage = action === 'remove'
      ? 'Are you sure you want to remove this content? This may also delete the associated listing or user.'
      : 'Are you sure you want to dismiss this flag?';

    showConfirmModal(confirmMessage, async () => {
      try {
        const url = `${config.API_BASE_URL}/${config.endpoints.HANDLE_FLAGGED_CONTENT}`;
        const response = await axios.post(url, {
          itemId,
          itemType,
          action
        }, { timeout: 10000 });

        const result = response.data;

        if (result.success) {
          setMessage({ text: `Flag ${action === 'dismiss' ? 'dismissed' : 'handled and content removed'} successfully`, type: 'success' });
          // Update state to remove the item from the displayed list
          setFlaggedContent(flaggedContent.filter(item => !(item.id === itemId && item.type === itemType)));
           // Optionally reload all data if a removal might affect other sections
           if (action === 'remove') {
            loadSectionData('listings'); // if content removed was a listing
            loadSectionData('users'); // if content removed was related to a user action
            loadSectionData('flagged'); // to refresh current view
           }
        } else {
          setMessage({ text: result.message || `Failed to handle flagged content`, type: 'error' });
        }
      } catch (error) {
        let errorMessage = `Error handling flagged content: ${error.message}`;
        if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        }
        console.error('Error handling flagged content:', error);
        setMessage({ text: errorMessage, type: 'error' });
      }
    });
  };


  // Handle logout
  const handleLogout = () => {
    logout(); // Call logout from AuthContext
    navigate('/login');
  };

  // Handle Exit to Home Page
  const handleExitToHome = () => {
    navigate('/');
  };


  // Render users section
  const renderUsersSection = () => (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <h2 className="text-xl font-semibold mb-4">Users Management</h2>
      <p className="text-gray-600 mb-4">Manage user accounts and permissions.</p>

      {message.text && (
        <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Email</th>
                <th className="py-2 px-4 border-b text-left">Role</th>
                <th className="py-2 px-4 border-b text-left">Registered On</th>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{user.id}</td>
                    <td className="py-2 px-4 border-b">{user.name}</td>
                    <td className="py-2 px-4 border-b">{user.email}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        disabled={user.id === currentUser?.id}
                        title={user.id === currentUser?.id ? "Cannot delete your own account" : "Delete user"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-500">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Render listings section
  const renderListingsSection = () => (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <h2 className="text-xl font-semibold mb-4">Listings Management</h2>
      <p className="text-gray-600 mb-4">Review and manage all active listings.</p>

      {message.text && (
        <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p>Loading listings...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Type</th>
                <th className="py-2 px-4 border-b text-left">Price</th>
                <th className="py-2 px-4 border-b text-left">Location</th>
                <th className="py-2 px-4 border-b text-left">Listed On</th>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.length > 0 ? (
                listings.map(listing => (
                  <tr key={`${listing.listing_type}-${listing.id}`} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{listing.id}</td>
                    <td className="py-2 px-4 border-b">{listing.name}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 text-xs rounded-full ${listing.listing_type === 'pet' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {listing.listing_type === 'pet' ? `Pet - ${listing.breed || 'N/A'}` : 'Supply'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">R{listing.price ? listing.price.toFixed(2) : 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{listing.location}</td>
                    <td className="py-2 px-4 border-b">{new Date(listing.created_at).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        onClick={() => navigate(`/listing/${listing.listing_type}/${listing.id}`)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        title="View listing details"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleManageListing(listing.id, listing.listing_type, 'markSold')}
                        className="text-green-500 hover:text-green-700 mx-2"
                        title="Mark as sold"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleManageListing(listing.id, listing.listing_type, 'delete')}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="Delete listing"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-4 text-center text-gray-500">No listings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Render flagged content section
  const renderFlaggedSection = () => (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <h2 className="text-xl font-semibold mb-4">Flagged Content</h2>
      <p className="text-gray-600 mb-4">Review and manage reported listings and users.</p>

      {message.text && (
        <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p>Loading flagged content...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Type</th>
                <th className="py-2 px-4 border-b text-left">Name/Title</th>
                <th className="py-2 px-4 border-b text-left">Reported By</th>
                <th className="py-2 px-4 border-b text-left">Reason</th>
                <th className="py-2 px-4 border-b text-left">Reported On</th>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flaggedContent.length > 0 ? (
                flaggedContent.map(item => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{item.id}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 text-xs rounded-full ${item.type === 'user' ? 'bg-purple-100 text-purple-700' : item.type === 'pet' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">{item.name || item.title}</td>
                    <td className="py-2 px-4 border-b">{item.reporter_name}</td>
                    <td className="py-2 px-4 border-b">{item.reason}</td>
                    <td className="py-2 px-4 border-b">{new Date(item.reported_at).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        onClick={() => item.type === 'user' ? navigate(`/profile?userId=${item.id}`) : navigate(`/listing/${item.type}/${item.id}`)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        title="View details"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleFlaggedAction(item.id, item.type, 'remove')}
                        className="text-red-500 hover:text-red-700 mx-2"
                        title="Remove content"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => handleFlaggedAction(item.id, item.type, 'dismiss')}
                        className="text-green-500 hover:text-green-700 ml-2"
                        title="Dismiss flag"
                      >
                        <X size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-4 text-center text-gray-500">No flagged content found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Render sold items section
  const renderSoldSection = () => (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <h2 className="text-xl font-semibold mb-4">Sold Items</h2>
      <p className="text-gray-600 mb-4">View and manage completed transactions.</p>

      {message.text && (
        <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p>Loading sold items...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Type</th>
                <th className="py-2 px-4 border-b text-left">Price</th>
                <th className="py-2 px-4 border-b text-left">Seller</th>
                <th className="py-2 px-4 border-b text-left">Buyer</th>
                <th className="py-2 px-4 border-b text-left">Sold On</th>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {soldItems.length > 0 ? (
                soldItems.map(item => (
                  <tr key={`${item.listing_type}-${item.id}`} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{item.id}</td>
                    <td className="py-2 px-4 border-b">{item.name}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 text-xs rounded-full ${item.listing_type === 'pet' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.listing_type === 'pet' ? 'Pet' : 'Supply'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">R{item.price ? item.price.toFixed(2) : 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{item.seller_name}</td>
                    <td className="py-2 px-4 border-b">{item.buyer_name || 'Unknown'}</td>
                    <td className="py-2 px-4 border-b">{new Date(item.sold_at).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        onClick={() => navigate(`/listing/${item.listing_type}/${item.id}`)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        title="View details"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleManageListing(item.id, item.listing_type, 'revert')}
                        className="text-orange-500 hover:text-orange-700 ml-2"
                        title="Revert to active listing"
                      >
                        <AlertTriangle size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-4 text-center text-gray-500">No sold items found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );


  // Render section content based on active section
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'users':
        return renderUsersSection();
      case 'listings':
        return renderListingsSection();
      case 'flagged':
        return renderFlaggedSection();
      case 'sold':
        return renderSoldSection();
      default:
        return <div className="p-6 text-gray-600">Select a section from the sidebar to view its content.</div>;
    }
  };

  // Sidebar navigation items
  const navItems = [
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'listings', label: 'Listings', icon: <ClipboardList size={20} /> },
    { id: 'flagged', label: 'Flagged Content', icon: <Flag size={20} /> },
    { id: 'sold', label: 'Sold Items', icon: <DollarSign size={20} /> },
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        {/* Added a simple spinner or loading text */}
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-700 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Dashboard Logo/Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <LayoutDashboard className="mr-2 text-orange-600" size={28} />
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          </div>
        </div>

        {/* Admin info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">Welcome back,</p>
          <p className="font-semibold text-gray-800 truncate">{currentUser.name}</p>
          <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-grow p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center w-full py-2.5 px-4 rounded-md transition-all duration-150 ease-in-out group ${
                  activeSection === item.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-orange-100 hover:text-orange-700'
                }`}
              >
                <span className={`mr-3 ${activeSection === item.id ? 'text-white' : 'text-gray-400 group-hover:text-orange-600'}`}>{item.icon}</span>
                <span>{item.label}</span>
                {activeSection === item.id && (
                  <ChevronRight size={18} className="ml-auto opacity-75" />
                )}
              </button>
            ))}
        </nav>

        {/* Footer Menu: Exit, Settings, Logout */}
        <div className="p-4 border-t border-gray-200 space-y-1">
          <button
            onClick={handleExitToHome}
            className="flex items-center w-full py-2.5 px-4 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors group"
          >
            <Home size={20} className="mr-3 text-gray-400 group-hover:text-orange-600" />
            <span>Exit to Home</span>
          </button>
          <button className="flex items-center w-full py-2.5 px-4 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors group">
            <Settings size={20} className="mr-3 text-gray-400 group-hover:text-gray-700" />
            <span>Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center w-full py-2.5 px-4 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors group"
          >
            <LogOut size={20} className="mr-3 text-red-400 group-hover:text-red-600" />
            <span>Logout</span>
          </button>
        </div>
      </div>


      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {renderSectionContent()}
      </div>
    </div>
  );
};

export default Dashboard;