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
  X
} from 'lucide-react';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('users');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  const apiBaseUrl = 'http://localhost/PET-C2C-PROJECT/TailTrade/Backend'; // Adjust this to match your setup



  // Check if user is logged in and is an admin
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);
      
      // Redirect non-admin users away from dashboard
      if (parsedUser.role !== 'admin') {
        navigate('/');
      } else {
        // Load data for the active section
        loadSectionData(activeSection);
      }
    } else {
      // Redirect to login if no user found
      navigate('/login');
    }
  }, [navigate]);

  // When active section changes, load relevant data
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      loadSectionData(activeSection);
    }
  }, [activeSection]);

  // Function to fetch data based on active section
  const loadSectionData = async (section) => {
    setLoading(true);
    try {
      switch (section) {
        case 'users':
          const usersResponse = await fetch(`${apiBaseUrl}/Admin/get_all_users.php`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          const usersData = await usersResponse.json();
          if (usersData.success) {
            setUsers(usersData.users);
          } else {
            setMessage({ text: usersData.message || 'Failed to load users', type: 'error' });
          }
          break;
          
        case 'listings':
          const listingsResponse = await fetch(`${apiBaseUrl}/Get_All_Listings.php`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          const listingsData = await listingsResponse.json();
          if (listingsData.success) {
            setListings(listingsData.listings);
          } else {
            setMessage({ text: listingsData.message || 'Failed to load listings', type: 'error' });
          }
          break;
          
        case 'flagged':
          const flaggedResponse = await fetch(`${apiBaseUrl}/Admin/get_flagged_content.php`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          const flaggedData = await flaggedResponse.json();
          if (flaggedData.success) {
            setFlaggedContent(flaggedData.flagged);
          } else {
            setMessage({ text: flaggedData.message || 'Failed to load flagged content', type: 'error' });
          }
          break;
          
        case 'sold':
          const soldResponse = await fetch(`${apiBaseUrl}/Admin/get_sold_items.php`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          const soldData = await soldResponse.json();
          if (soldData.success) {
            setSoldItems(soldData.sold);
          } else {
            setMessage({ text: soldData.message || 'Failed to load sold items', type: 'error' });
          }
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error(`Error loading ${section} data:`, error);
      setMessage({ text: `Error loading data: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await fetch(`${apiBaseUrl}/Admin/delete_user.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        
        const result = await response.json();
        
        if (result.success) {
          setMessage({ text: 'User deleted successfully', type: 'success' });
          // Update users list by removing the deleted user
          setUsers(users.filter(user => user.id !== userId));
        } else {
          setMessage({ text: result.message || 'Failed to delete user', type: 'error' });
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setMessage({ text: `Error: ${error.message}`, type: 'error' });
      }
    }
  };

  // Handle listing management
  const handleManageListing = async (listingId, listingType, action) => {
    try {
      const endpoint = action === 'delete' 
        ? `${apiBaseUrl}/Admin/delete_listing.php`
        : `${apiBaseUrl}/Admin/update_listing_status.php`;
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          listingId, 
          listingType,
          status: action === 'markSold' ? 'sold' : null
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage({ text: `Listing ${action === 'delete' ? 'deleted' : 'updated'} successfully`, type: 'success' });
        // Reload the listings
        loadSectionData(activeSection);
      } else {
        setMessage({ text: result.message || `Failed to ${action} listing`, type: 'error' });
      }
    } catch (error) {
      console.error(`Error ${action} listing:`, error);
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    }
  };

  // Handle flagged content actions
  const handleFlaggedAction = async (itemId, itemType, action) => {
    try {
      const response = await fetch(`${apiBaseUrl}/Admin/handle_flagged_content.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemId, 
          itemType,
          action // 'dismiss' or 'remove'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage({ text: `Flag ${action === 'dismiss' ? 'dismissed' : 'handled and content removed'} successfully`, type: 'success' });
        // Update flagged content list
        setFlaggedContent(flaggedContent.filter(item => !(item.id === itemId && item.type === itemType)));
      } else {
        setMessage({ text: result.message || `Failed to handle flagged content`, type: 'error' });
      }
    } catch (error) {
      console.error('Error handling flagged content:', error);
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
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
                        disabled={user.id === currentUser.id} // Prevent admin from deleting themselves
                        title={user.id === currentUser.id ? "Cannot delete your own account" : "Delete user"}
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
                    <td className="py-2 px-4 border-b">${listing.price.toFixed(2)}</td>
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
                    <td className="py-2 px-4 border-b">${item.price.toFixed(2)}</td>
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
        return <div>Select a section from the sidebar</div>;
    }
  };

  // Sidebar navigation items
  const navItems = [
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'listings', label: 'Listings', icon: <ClipboardList size={20} /> },
    { id: 'flagged', label: 'Flagged Content', icon: <Flag size={20} /> },
    { id: 'sold', label: 'Sold Items', icon: <DollarSign size={20} /> },
  ];

  // If not yet determined if user is admin, show loading state
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        {/* Dashboard Logo/Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <LayoutDashboard className="mr-2" size={24} style={{ color: 'var(--color-primary)' }} />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
        </div>

        {/* Admin info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">Logged in as:</p>
          <p className="font-medium truncate">{currentUser.name}</p>
          <p className="text-xs text-gray-500">{currentUser.email}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.id} className="mb-2">
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center w-full py-2 px-4 rounded-md transition-colors ${
                    activeSection === item.id
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={{ 
                    color: activeSection === item.id ? 'var(--color-primary)' : '', 
                    backgroundColor: activeSection === item.id ? 'rgba(var(--color-primary-rgb), 0.1)' : ''
                  }}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                  {activeSection === item.id && (
                    <ChevronRight size={16} className="ml-auto" />
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Settings and Logout section */}
          <div className="mt-8 border-t border-gray-200 pt-4">
            <button className="flex items-center w-full py-2 px-4 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
              <Settings size={20} className="mr-3" />
              <span>Settings</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center w-full py-2 px-4 rounded-md text-red-600 hover:bg-red-50 transition-colors mt-2"
            >
              <LogOut size={20} className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {renderSectionContent()}
      </div>
    </div>
  );
};

export default Dashboard;