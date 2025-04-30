import React, { useState, useEffect } from 'react';
import { Search, Heart, User, Menu, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ scrollToSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
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
    // Optionally reload or navigate
    window.location.reload();
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
          <a href="#listed-pets" onClick={scrollToSection('listed-pets')} className="text-gray-700 hover:text-gray-900">Browse Pets</a>
          <a href="#footer" onClick={scrollToSection('footer')} className="text-gray-700 hover:text-gray-900">About</a>
          <a href="#footer" onClick={scrollToSection('footer')} className="text-gray-700 hover:text-gray-900">Contact</a>
        </nav>

        {/* Right Side Icons & Burger Menu */}
        <div className="flex items-center space-x-4">
          <a href="#" className="text-gray-700 hover:text-gray-900">
            <Search size={22} />
          </a>
          <a href="#" className="text-gray-700 hover:text-gray-900 hidden md:block">
            <User size={22} />
          </a>
          <a href="#" className="text-gray-700 hover:text-gray-900 hidden md:block">
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
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                role="menu"
                aria-orientation="vertical"
              >
                {currentUser ? (
                  <>
                    <div className="block px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      {currentUser.name} ({currentUser.role})
                    </div>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={() => setIsMenuOpen(false)}>My Purchases</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={() => setIsMenuOpen(false)}>My Wallet</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={() => setIsMenuOpen(false)}>Settings</a>
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-200" 
                      role="menuitem" 
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={() => setIsMenuOpen(false)}>Sign In / Register</Link>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMenuOpen(false); }}>Home</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={() => setIsMenuOpen(false)}>Browse Pets</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={() => setIsMenuOpen(false)}>About Us</a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;