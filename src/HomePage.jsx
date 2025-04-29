import React from 'react';
import { Search, Heart, User, ShoppingBag, Facebook, Instagram, Twitter } from 'lucide-react';

const TailTradeHomepage = () => {


  // Color palette
  const colors = {
    primary: '#FF7A59', // Coral/orange color
    darkBg: '#2D303A',  // Dark background color
    white: '#FFFFFF',
    lightGray: '#F8F8F8',
    textDark: '#333333',
  };

  // Sample pet data
  const featuredPets = [
    { id: 1, name: 'Max', type: 'Dog', breed: 'Labrador Retriever', price: 'R 1,200.00', location: 'Johannesburg', image: './src/assets/placeholder images/list-lab.jpg.jpg' },
    { id: 2, name: 'Bella', type: 'Dog', breed: 'French Bulldog', price: 'R 2,500.00', location: 'Cape Town', image: './src/assets/placeholder images/list-frech-bull.jpg.jpg' },
    { id: 3, name: 'Luna', type: 'Cat', breed: 'Siamese', price: 'R 850.00', location: 'Durban', image: './src/assets/placeholder images/list-siamese.jpg.jpg' },
    { id: 4, name: 'Rocky', type: 'Dog', breed: 'Golden Retriever', price: 'R 1,700.00', location: 'Pretoria', image: './src/assets/placeholder images/list-golden-retriever.jpg.jpg' },
  ];

  // Popular breeds (Using the list from the inner, more complete version)

  const popularBreeds = [
    { name: 'Boerboel', icon: './src/assets/placeholder images/icon-boerboel.jpg.jpg', type: 'Boerboel Dog' },
    { name: 'Labrador Retriever', icon: './src/assets/placeholder images/icon-golden-retriever.jpg.jpg', type: 'Labrador Dog' },
    { name: 'Yorkshire Terrier', icon: './src/assets/placeholder images/icon-yorkshire.jpg.jpg', type: 'Yorkshite Dog' },
    { name: 'Maine Coon', icon: './src/assets/placeholder images/icon-maine-coon.jpg.jpg', type: 'Maine Coon Cat' },
    { name: 'Ragdoll', icon: './src/assets/placeholder images/icon-ragdol.jpg.jpg', type: 'RagDoll Cat' },
  ];

  // Pet card component (defined inside or outside TailTradeHomepage, outside is often preferred for organization)
  const PetCard = ({ pet }) => (
    <div className="bg-white rounded-lg overflow-hidden shadow-md flex flex-col h-full">
      <div className="relative">
        <img src={pet.image} alt={pet.name} className="w-full h-48 object-cover" />
        <button className="absolute top-2 right-2 bg-white p-1 rounded-full">
          <Heart size={18} color={colors.textDark} />
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

  // The main return statement for the TailTradeHomepage component
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Arial, sans-serif' }}>


      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-4">
              <div style={{ backgroundColor: colors.primary }} className="flex items-center justify-center w-10 h-10 rounded-full">

                {/* LOGO */}
                <span className="text-white font-bold">T</span> 
              </div>
            </div>
            <h1 className="text-2xl font-bold italic 
                          bg-gradient-to-r from-gray-950 via-gray-800 to-gray-800 bg-[length:250%_100%] bg-right bg-clip-text text-transparent">TailTrade</h1>
          </div>

          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-700 hover:text-gray-900">Home</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Browse Pets</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">About</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Contact</a>
          </nav>

          <div className="flex items-center space-x-4">
            <a href="#" className="text-gray-700 hover:text-gray-900">
              <User size={20} />
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900">
              <Heart size={20} />
            </a>
            <a href="#" className="px-4 py-2 rounded" style={{ backgroundColor: colors.primary, color: 'white' }}>
              Sign In / Register
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}


      <section className="relative bg-gray-100 py-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">

             {/* BANNER MESSAGE */}
            <div className="p-6 rounded-lg bg-gray-150" >
              <h2 className="text-gray-800 text-6xl font-bold mb-2 italic">Where <span className="text-[#FF7A59]">Tails</span> Find-</h2>
              <h2 className="text-gray-800 text-5xl font-bold mb-4 italic">New Homes</h2>
              <p className="text-gray-800 mb-6 text-2xl font-semibold italic">And <span className="text-[#FF7A59]">YOU</span> find life long companions</p>
            </div>
          </div>
          <div className="md:w-1/2">
            {/* HERO IMAGE */}
            <img  src="./src/assets/placeholder images/hero.jpg.jpg" alt="Dog" className="rounded-lg shadow-lg h-80" />
          </div>
        </div>
      </section>

      {/* Search Bar */}

      <section className="py-6 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search for</label>
                <input type="text" placeholder="Dogs, gadgets, food..." className="w-full px-4 py-2 border rounded-md" />
              </div>
              <div className="md:w-1/4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full px-4 py-2 border rounded-md">
                  <option>Dogs</option>
                  <option>Cats</option>
                </select>
              </div>
              <div className="md:w-1/4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" placeholder="Cape Town, South Africa" className="w-full px-4 py-2 border rounded-md" />
              </div>
              <div className="md:w-auto self-end">
                <button
                  className="w-full md:w-auto px-6 py-2 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: colors.primary, color: 'white' }}
                >
                  <Search size={18} className="mr-2" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NAVIGATION ICONS */}

      <section className="py-8 bg-white border-t border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="#" className="flex flex-col items-center justify-center p-4 rounded-lg  bg-gray-50 hover:bg-gray-100 ">
              <div className="w-12 h-12 flex items-center justify-center mb-2=">
                 {/* Consider using different icons for different actions */}
                <ShoppingBag size={28} />
              </div>
              <span className="text-sm font-medium text-center">ADOPT A PET</span>
            </a>
            <a href="#" className="flex flex-col items-center justify-center p-4 rounded-lg  bg-gray-50 hover:bg-gray-100" >
              <div className="w-12 h-12 flex items-center justify-center mb-2">
                <ShoppingBag size={28}  />
              </div>
              <span className="text-sm font-medium">LIST A PET</span>
            </a>
            <a href="#" className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100">
              <div className="w-12 h-12 flex items-center justify-center mb-2">
                <ShoppingBag size={28} />
              </div>
              <span className="text-sm font-medium text-center">PET ESSENTIALS</span>
            </a>
            <a href="#" className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100">
              <div className="w-12 h-12 flex items-center justify-center mb-2">
                <ShoppingBag size={28} />
              </div>
              <span className="text-sm font-medium text-center">PET FOOD</span>
            </a>
          </div>
        </div>
      </section>

      {/* Popular Breeds */}

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">POPULAR <span style={{ color: colors.primary }}>BREEDS</span></h2>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {popularBreeds.map((breed, index) => (
              <a key={index} href="#" className="flex flex-col items-center group mx-4">
                <div className="rounded-full overflow-hidden mb-2 border-2 border-transparent group-hover:border-orange-500">
                  {/* Make sure these placeholder paths work */}
                  <img src={breed.icon} alt={breed.name} className="w-16 h-16 md:w-20 md:h-20 object-cover" />
                </div>
                <span className="text-sm font-medium">{breed.name}</span>
                <span className="text-xs text-gray-500">{breed.type}</span>
              </a>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="#"
              className="inline-block border border-gray-300 text-sm px-6 py-2 rounded-md hover:bg-gray-50"
            >
              VIEW ALL BREEDS
            </a>
          </div>
        </div>
      </section>

      {/* LISTED PETS */}
      <section className="py-12" style={{ backgroundColor: colors.primary }}>
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center text-white">LISTED <span className="text-white">PETS</span></h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPets.map(pet => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="#"
              className="inline-block bg-white text-sm px-6 py-2 rounded-md hover:bg-gray-50"
            >
              VIEW ALL PETS
            </a>
          </div>
        </div>
      </section>

      {/* Pet Services Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">PET <span style={{ color: colors.primary }}>SERVICES</span></h2>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 ">
            {['Pet Grooming', 'SPCA', 'Veterinary', 'Pet Day Care', 'Pet Sitter'].map((service, index) => (
              <a key={index} href="#" className="flex flex-col items-center">
                <div className="w-10 h-10 mb-2 flex items-center justify-center">
                  {/* Consider specific icons for each service */}
                  <ShoppingBag size={24} />
                </div>
                <span className="text-xs md:text-sm text-center">{service}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}


      <footer style={{ backgroundColor: colors.darkBg }} className="py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">About TailTrade</h3>
              <p className="text-gray-400 text-sm">TailTrade is a platform connecting pet lovers with their perfect companions in South Africa.</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 text-sm hover:text-white">Home</a></li>
                <li><a href="#" className="text-gray-400 text-sm hover:text-white">Browse Pets</a></li>
                <li><a href="#" className="text-gray-400 text-sm hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 text-sm hover:text-white">Contact</a></li>
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
                <a href="#" className="text-gray-400 hover:text-white">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Twitter size={20} />
                </a>
              </div>
              <p className="text-gray-400 text-sm">Email: info@tailtrade.co.za</p>
              <p className="text-gray-400 text-sm">Phone: +27 83 123 4567</p> {/* Example number */}
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6">
             {/* Updated copyright year */}
            <p className="text-gray-400 text-sm text-center">© {new Date().getFullYear()} TailTrade. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TailTradeHomepage;