import React from 'react';

const PopularBreeds = ({ breeds }) => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">POPULAR <span style={{ color: 'var(--color-primary)' }}>BREEDS</span></h2>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {breeds.map((breed, index) => (
            <a key={index} href="#" className="flex flex-col items-center group mx-4 p-2 rounded-lg hover:bg-orange-50 transition-colors">
              <div className="rounded-full overflow-hidden mb-2 border-2 border-gray-200 group-hover:border-orange-400 transition-colors">
                <img src={breed.icon} alt={breed.name} className="w-16 h-16 md:w-20 md:h-20 object-cover" />
              </div>
              <span className="text-sm font-medium text-gray-800">{breed.name}</span>
              <span className="text-xs text-gray-500">{breed.type}</span>
            </a>
          ))}
        </div>
        <div className="text-center mt-8">
          <a
            href="#"
            className="inline-block border border-gray-300 text-sm px-6 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors"
          >
            VIEW ALL BREEDS
          </a>
        </div>
      </div>
    </section>
  );
};

export default PopularBreeds;