import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = ({ scrollToSection }) => {
  // Fallback in case scrollToSection is not passed
  const handleScroll = (id) => {
    if (typeof scrollToSection === 'function') {
      scrollToSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else console.warn(`Section with id "${id}" not found.`);
    }
  };

  return (
    <footer id="footer" className="py-8 mt-auto" style={{ backgroundColor: 'var(--color-dark-bg)' }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold mb-4">About TailTrade</h3>
            <p className="text-gray-400 text-sm">
              TailTrade is a platform connecting pet lovers with their perfect companions in South Africa.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-gray-400 text-sm hover:text-white"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#listed-pets"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScroll('listed-pets');
                  }}
                  className="text-gray-400 text-sm hover:text-white"
                >
                  Browse Pets
                </a>
              </li>
              <li>
                <a
                  href="#footer"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScroll('footer');
                  }}
                  className="text-gray-400 text-sm hover:text-white"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#footer"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScroll('footer');
                  }}
                  className="text-gray-400 text-sm hover:text-white"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 text-sm hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-white">Cookie Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Connect with Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-white"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Twitter size={20} /></a>
            </div>
            <p className="text-gray-400 text-sm">Email: info@tailtrade.co.za</p>
            <p className="text-gray-400 text-sm">Phone: +27 83 123 4567</p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <p className="text-gray-400 text-sm text-center">© {new Date().getFullYear()} TailTrade. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
