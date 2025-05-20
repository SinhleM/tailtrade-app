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
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('users');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Check if user is logged in and is an admin
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);
      
      // Redirect non-admin users away from dashboard
      if (parsedUser.role !== 'admin') {
        navigate('/');
      }
    } else {
      // Redirect to login if no user found
      navigate('/login');
    }
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // Placeholder content for different sections
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'users':
        return (
          <div className="bg-white rounded-lg shadow p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">Users Management</h2>
            <p className="text-gray-600">Manage user accounts, permissions and view user activity.</p>
            {/* User management content would go here */}
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-500 text-sm">User data would be displayed here.</p>
            </div>
          </div>
        );
      case 'listings':
        return (
          <div className="bg-white rounded-lg shadow p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">Listings Management</h2>
            <p className="text-gray-600">Review, approve, edit or delete listings from the marketplace.</p>
            {/* Listings management content would go here */}
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-500 text-sm">Listing data would be displayed here.</p>
            </div>
          </div>
        );
      case 'flagged':
        return (
          <div className="bg-white rounded-lg shadow p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">Flagged Content</h2>
            <p className="text-gray-600">Review and moderate listings or users that have been flagged.</p>
            {/* Flagged content management would go here */}
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-500 text-sm">Flagged content would be displayed here.</p>
            </div>
          </div>
        );
      case 'sold':
        return (
          <div className="bg-white rounded-lg shadow p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">Sold Items</h2>
            <p className="text-gray-600">View and manage completed transactions and sales history.</p>
            {/* Sold items management would go here */}
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-500 text-sm">Sales data would be displayed here.</p>
            </div>
          </div>
        );
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