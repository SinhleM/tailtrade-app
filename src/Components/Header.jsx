import React, { useState, useEffect } from 'react';
import { Search, Heart, User, Menu as MenuIcon, LogOut } from 'lucide-react'; // Renamed Menu to MenuIcon to avoid conflict
import { Link, useNavigate } from 'react-router-dom';

// Header component: Manages navigation, user authentication status, and search.
// - scrollToSection: Function to scroll to specific sections on the homepage.
const Header = ({ scrollToSection }) => {
  // State for managing the mobile menu's open/closed status.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // State for storing the currently logged-in user's data.
  const [currentUser, setCurrentUser] = useState(null);
  // State to track if the search input is focused (can be used for UI changes).
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  // State for the search input value.
  const [searchQuery, setSearchQuery] = useState('');

  // Hook for programmatic navigation.
  const navigate = useNavigate();

  // Effect to check for logged-in user data in localStorage when the component mounts.
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Toggles the mobile menu open or closed.
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handles user logout.
  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user data from localStorage.
    setCurrentUser(null); // Reset user state.
    setIsMenuOpen(false); // Close mobile menu if open.
    navigate('/'); // Navigate to the homepage.
    // Consider window.location.reload() if header doesn't update immediately across all scenarios.
  };

  // Handles the search input change.
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handles the search submission (e.g., when Enter is pressed).
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery) {
        // Navigate to the Menu page with the search query as a URL parameter.
        navigate(`/Menu?search=${encodeURIComponent(trimmedQuery)}`);
      } else {
        // If the query is empty, navigate to the Menu page without a search parameter.
        navigate('/Menu');
      }
      setSearchQuery(''); // Clear search input after submission
      setIsSearchFocused(false); // Unfocus the search bar
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto py-4 px-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center">

          <Link to="/">
            <h1 className="text-2xl font-bold italic bg-gradient-to-r from-gray-950 via-gray-800 to-gray-800 bg-[length:250%_100%] bg-right bg-clip-text text-transparent">
              TailTrade
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation Links (Hidden on Mobile) */}
        <nav className="hidden md:flex space-x-6">
          {/* Link to browse pets/items, scrolls to section or navigates to Menu */}
          <Link to="/Menu" className="text-gray-700 hover:text-gray-900 hover:underline">Pets & Items</Link>
          <a href="/#footer" onClick={scrollToSection ? scrollToSection('footer') : (e) => { e.preventDefault(); document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-gray-700 hover:text-gray-900 hover:underline">About</a>
          <a href="/#footer" onClick={scrollToSection ? scrollToSection('footer') : (e) => { e.preventDefault(); document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-gray-700 hover:text-gray-900 hover:underline">Contact</a>
          {/* Link to create a listing, shown if a user is logged in. */}
          {currentUser && (
            <Link to="/list-pet" className="text-gray-700 hover:text-gray-900">Make a listing</Link>
          )}
        </nav>

        {/* Right Side Icons & Burger Menu */}
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center relative rounded-full bg-gray-100 px-4 py-2 w-64">
            <Search size={18} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search listings..."
              className="bg-transparent border-none outline-none text-sm w-full"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyPress={handleSearchSubmit} // Changed from handleSearch to handleSearchSubmit
            />
          </div>

          {/* User Icon: Links to profile if logged in, or login page if not. */}
          {currentUser ? (
            <Link to="/profile" className="text-gray-700 hover:text-gray-900 hidden md:block" title="Profile">
              <User size={22} />
            </Link>
          ) : (
            <Link to="/login" className="text-gray-700 hover:text-gray-900 hidden md:block" title="Login/Register">
              <User size={22} />
            </Link>
          )}
          {/* Wishlist Icon (functionality not implemented in this scope) */}
          <a href="#" className="text-gray-700 hover:text-gray-900 hidden md:block" title="Wishlist">
            <Heart size={22} />
          </a>

          {/* Sign In / Register Button or User Info */}
          {currentUser ? (
            <div className="hidden md:flex items-center px-4 py-2 rounded" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
              <span className="mr-2">Hi, {currentUser.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="flex items-center" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="px-4 py-2 rounded hidden md:block" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
              Sign In / Register
            </Link>
          )}

          {/* Burger Menu Button for mobile */}
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              <MenuIcon size={28} /> {/* Changed from Menu to MenuIcon */}
            </button>
            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                role="menu"
                aria-orientation="vertical"
              >
                {currentUser ? (
                  <>
                    {/* Logged-in user menu items */}
                    <div className="block px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                      Signed in as:
                      <span className="block font-medium text-gray-800">{currentUser.name}</span>
                      <span className="block text-xs text-gray-600">({currentUser.role})</span>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                      My Profile
                    </Link>
                    <Link to="/list-pet" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                      Make a Listing
                    </Link>
                    {/* Placeholder for "My Listings" - functionality to be added */}
                    <Link to="/Menu?myListings=true" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={() => setIsMenuOpen(false)}>My Listings</Link>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={() => setIsMenuOpen(false)}>Wishlist</a>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-800 border-t border-gray-200"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {/* Logged-out user menu items */}
                    <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={() => setIsMenuOpen(false)}>Sign In / Register</Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link to="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link to="/Menu" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={() => setIsMenuOpen(false)}>Browse Pets & Items</Link>
                    <a href="/#footer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={(e) => { e.preventDefault(); document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }}>About Us</a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - Full Width Below Header */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex items-center relative rounded-full bg-gray-100 px-4 py-2">
          <Search size={18} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search listings..."
            className="bg-transparent border-none outline-none text-sm w-full"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onKeyPress={handleSearchSubmit} // Changed from handleSearch to handleSearchSubmit
          />
        </div>
      </div>
    </header>
  );
};

export default Header;