import React from 'react';
import { ShoppingBag } from 'lucide-react';

const NavIcons = ({ scrollToSection }) => {
  return (
    <section className="py-8 bg-white border-t border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <a href="./Menu?search=Pet"  className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 flex items-center justify-center mb-2 text-gray-700">
              <ShoppingBag size={28} />
            </div>
            <span className="text-sm font-medium text-center text-gray-800">ADOPT A PET</span>
          </a>
          <a href="./list-pet" className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 flex items-center justify-center mb-2 text-gray-700">
              <ShoppingBag size={28} />
            </div>
            <span className="text-sm font-medium text-center text-gray-800">LIST A PET</span>
          </a>
          <a href="./Menu?search=supply" className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 flex items-center justify-center mb-2 text-gray-700">
              <ShoppingBag size={28} />
            </div>
            <span className="text-sm font-medium text-center text-gray-800">PET ESSENTIALS</span>
          </a>
          <a href="./Menu?search=supply" className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 flex items-center justify-center mb-2 text-gray-700">
              <ShoppingBag size={28} />
            </div>
            <span className="text-sm font-medium text-center text-gray-800">PET FOOD</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default NavIcons;