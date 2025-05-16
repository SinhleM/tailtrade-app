import React from 'react';
import PetCard from './PetCard';

const ListedPets = ({ pets }) => {
  return (
    <section id="listed-pets" className="py-12" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center text-white">
          FEATURED <span className="text-white">PETS</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pets.map(pet => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
        <div className="text-center mt-8">
          <a
            href="./Menu?search=pet"
            className="inline-block bg-white text-sm px-6 py-2 rounded-md text-gray-800 hover:bg-gray-50 transition-colors"
          >
            VIEW ALL PETS
          </a>
        </div>
      </div>
    </section>
  );
};

export default ListedPets;
