import React, { useState, useEffect } from 'react';
import { Search, Heart, User, Menu, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // Ensure Link is imported

const Header = ({ scrollToSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsMenuOpen(false);
    // Optionally reload or navigate to home
    navigate('/'); // Navigate to home after logout
    // window.location.reload(); // Or reload if state isn't updating correctly everywhere
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      console.log('Searching for:', e.target.value);
      // Add your search logic here
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto py-4 px-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center">
          <div className="mr-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}>
              <span className="text-white font-bold">T</span>
            </div>
          </div>
          <Link to="/">
            <h1 className="text-2xl font-bold italic bg-gradient-to-r from-gray-950 via-gray-800 to-gray-800 bg-[length:250%_100%] bg-right bg-clip-text text-transparent">
              TailTrade
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation Links (Hidden on Mobile) */}
        <nav className="hidden md:flex space-x-6">
          <a href="/#listed-pets" onClick={scrollToSection ? scrollToSection('listed-pets') : (e) => { e.preventDefault(); document.getElementById('listed-pets')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-gray-700 hover:text-gray-900">Browse Pets</a>
          <a href="/#footer" onClick={scrollToSection ? scrollToSection('footer') : (e) => { e.preventDefault(); document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-gray-700 hover:text-gray-900">About</a>
          <a href="/#footer" onClick={scrollToSection ? scrollToSection('footer') : (e) => { e.preventDefault(); document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-gray-700 hover:text-gray-900">Contact</a>
          {/* Potentially add List Pet link here if user is logged in */}
           {currentUser && (
            <Link to="/list-pet" className="text-gray-700 hover:text-gray-900">List a Pet</Link>
           )}
        </nav>

        {/* Right Side Icons & Burger Menu */}
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center relative rounded-full bg-gray-100 px-4 py-2 w-64">
            <Search size={18} className="text-gray-500 mr-2" />
            <input 
              type="text" 
              placeholder="Search products, stores or brands" 
              className="bg-transparent border-none outline-none text-sm w-full"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyPress={handleSearch}
            />
          </div>

          {/* User Icon - only show on desktop if not searching */}
          {currentUser ? (
             <Link to="/profile" className="text-gray-700 hover:text-gray-900 hidden md:block" title="Profile">
              <User size={22} />
            </Link>
           ) : (
             <Link to="/login" className="text-gray-700 hover:text-gray-900 hidden md:block" title="Login/Register">
              <User size={22} />
            </Link>
           )}

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

          {/* Burger Menu Button */}
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              <Menu size={28} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200" // Increased width slightly
                role="menu"
                aria-orientation="vertical"
              >
                {currentUser ? (
                  <>
                    {/* --- Modified Burger Menu Logged In --- */}
                    <div className="block px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                      Signed in as:
                      <span className="block font-medium text-gray-800">{currentUser.name}</span>
                      <span className="block text-xs text-gray-600">({currentUser.role})</span>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                      My Profile
                    </Link>
                     {/* Link to List Pet page */}
                    <Link to="/list-pet" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                       List a Pet
                    </Link>
                    {/* Other user-specific links */}
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={() => setIsMenuOpen(false)}>My Listings</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={() => setIsMenuOpen(false)}>Wishlist</a>
                    {/* <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={() => setIsMenuOpen(false)}>Settings</a> */}
                     {/* --- End Modified Burger Menu Logged In --- */}

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
                    <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={() => setIsMenuOpen(false)}>Sign In / Register</Link>
                    <div className="border-t border-gray-100 my-1"></div> {/* Separator */}
                    <Link to="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={(e) => { setIsMenuOpen(false); /* Let Link handle navigation */ }}>Home</Link>
                    <a href="/#listed-pets" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem" onClick={(e) => { e.preventDefault(); document.getElementById('listed-pets')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }}>Browse Pets</a>
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
            placeholder="Search products, stores or brands" 
            className="bg-transparent border-none outline-none text-sm w-full"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onKeyPress={handleSearch}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;