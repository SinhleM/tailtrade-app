import React, { useState } from 'react';
import { Heart } from 'lucide-react';

const PetCard = ({ pet }) => {
  const [isLiked, setIsLiked] = useState(false); // State for like button

  const handleLikeClick = (e) => {
    e.preventDefault(); // Prevent navigation if card is wrapped in <a>
    e.stopPropagation(); // Prevent triggering card hover effects if needed
    setIsLiked(!isLiked);
  };

  return (
    // Added group, transitions for scale and shadow
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl flex flex-col h-full group transition-all duration-300 ease-in-out hover:scale-[1.03]">
      <div className="relative">
        {/* Added opacity transition */}
        <img
          src={pet.image}
          alt={pet.name}
          className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
        />
        {/* Like Button Styling */}
        <button
          onClick={handleLikeClick}
          className={`absolute top-2 right-2 bg-white p-1.5 rounded-full transition-colors duration-200 ease-in-out
                    ${isLiked ? `text-rose-600` : `text-gray-500 hover:text-rose-600`}
                   `} 
          aria-label="Like pet"
        >
          <Heart
            size={20}
            fill={isLiked ? 'currentColor' : 'none'}
          />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg mb-1">{pet.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{pet.breed}</p>
        <p className="text-sm mb-1">{pet.location}</p>
        <p className="font-bold mt-auto">{pet.price}</p>
      </div>
    </div>
  );
};

export default PetCard;