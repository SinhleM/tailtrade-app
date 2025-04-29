import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = () => {
  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-white shadow-md rounded-lg p-4">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search for</label>
              <input type="text" placeholder="Dogs, gadgets, food..." className="w-full px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 focus:bg-gray-200 transition-colors duration-200" />
            </div>
            <div className="md:w-1/4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="w-full px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 focus:bg-gray-200 transition-colors duration-200">
                <option>Dogs</option>
                <option>Cats</option>
              </select>
            </div>
            <div className="md:w-1/4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" placeholder="Cape Town, South Africa" className="w-full px-4 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 focus:bg-gray-200 transition-colors duration-200" />
            </div>
            <div className="md:w-auto self-end">
              <button
                className="w-full md:w-auto px-6 py-2 rounded-md flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Search size={18} className="mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;