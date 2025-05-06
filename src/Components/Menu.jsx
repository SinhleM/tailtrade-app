import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [petTypeFilter, setPetTypeFilter] = useState(searchParams.get('petType') || 'all');
  const [breedFilter, setBreedFilter] = useState(searchParams.get('breed') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get('minPrice') || 0),
    parseInt(searchParams.get('maxPrice') || 10000)
  ]);
  const [location, setLocation] = useState(searchParams.get('location') || 'all');
  
  // Collapsible section states for mobile
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    petFilters: true,
    sort: true,
    price: true,
    location: true
  });

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  // Sample data - would be replaced with API calls
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      // Sample pet data
      const sampleProducts = [
        {
          id: 1,
          name: 'Golden Retriever',
          category: 'pet',
          petType: 'dog',
          breed: 'Golden Retriever',
          price: 1500,
          location: 'Cape Town',
          image: '/placeholder-dog.jpg',
          date: new Date('2023-01-15')
        },
        {
          id: 2,
          name: 'Maine Coon',
          category: 'pet',
          petType: 'cat',
          breed: 'Maine Coon',
          price: 900,
          location: 'Johannesburg',
          image: '/placeholder-cat.jpg',
          date: new Date('2023-02-20')
        },
        {
          id: 3,
          name: 'Premium Dog Food',
          category: 'supplies',
          petType: 'dog',
          price: 250,
          location: 'Durban',
          image: '/placeholder-dogfood.jpg',
          date: new Date('2023-03-10')
        },
        {
          id: 4,
          name: 'Cat Tree',
          category: 'supplies',
          petType: 'cat',
          price: 450,
          location: 'Pretoria',
          image: '/placeholder-cattree.jpg',
          date: new Date('2023-03-05')
        },
        {
          id: 5,
          name: 'Labrador',
          category: 'pet',
          petType: 'dog',
          breed: 'Labrador',
          price: 1200,
          location: 'Cape Town',
          image: '/placeholder-lab.jpg',
          date: new Date('2023-01-10')
        },
        {
          id: 6,
          name: 'Siamese Cat',
          category: 'pet',
          petType: 'cat',
          breed: 'Siamese',
          price: 800,
          location: 'Johannesburg',
          image: '/placeholder-siamese.jpg',
          date: new Date('2023-02-25')
        }
      ];
      setProducts(sampleProducts);
      setLoading(false);
    }, 1000);
  }, []);

  // Apply filters to the product list
  const filteredProducts = products.filter(product => {
    // Filter by category
    if (categoryFilter !== 'all' && product.category !== categoryFilter) return false;
    
    // Filter by pet type if it's relevant
    if (categoryFilter === 'pet' || (categoryFilter === 'all' && product.category === 'pet')) {
      if (petTypeFilter !== 'all' && product.petType !== petTypeFilter) return false;
      
      // Filter by breed if pet type is selected
      if (petTypeFilter !== 'all' && breedFilter !== 'all' && product.breed !== breedFilter) return false;
    }
    
    // Filter by price range
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    
    // Filter by location
    if (location !== 'all' && product.location !== location) return false;
    
    return true;
  });

  // Sort the filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.date - a.date;
      case 'oldest':
        return a.date - b.date;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  // Update URL with filter params
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (petTypeFilter !== 'all') params.set('petType', petTypeFilter);
    if (breedFilter !== 'all') params.set('breed', breedFilter);
    if (sortBy !== 'newest') params.set('sortBy', sortBy);
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0]);
    if (priceRange[1] < 10000) params.set('maxPrice', priceRange[1]);
    if (location !== 'all') params.set('location', location);
    
    setSearchParams(params);
  }, [categoryFilter, petTypeFilter, breedFilter, sortBy, priceRange, location, setSearchParams]);

  // Generate breeds list based on pet type
  const getBreedsList = () => {
    const petType = petTypeFilter;
    if (petType === 'dog') {
      return ['Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle'];
    } else if (petType === 'cat') {
      return ['Maine Coon', 'Siamese', 'Persian', 'Bengal', 'Ragdoll'];
    }
    return [];
  };

  const handleRangeChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(e.target.value);
    setPriceRange(newRange);
  };

  // Toggle mobile filter panel
  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-950 via-gray-800 to-gray-800 bg-[length:250%_100%] bg-right bg-clip-text text-transparent">
          Browse Products
        </h1>
        <p className="text-gray-600 mt-2">
          Find the perfect pet or pet supplies for your home
        </p>
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4">
        <button 
          onClick={toggleMobileFilter}
          className="flex items-center justify-center w-full py-2 px-4 rounded"
          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
        >
          <Filter size={18} className="mr-2" />
          Filters ({filteredProducts.length} results)
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Filter Panel - Hidden on mobile until filter button is clicked */}
        <div className={`${isMobileFilterOpen ? 'fixed inset-0 z-50 overflow-auto bg-white p-4' : 'hidden'} md:block md:relative md:w-64 md:mr-6 md:z-auto`}>
          {/* Mobile Close Button */}
          {isMobileFilterOpen && (
            <div className="flex justify-between items-center md:hidden mb-4 pb-2 border-b">
              <h3 className="text-xl font-bold">Filters</h3>
              <button 
                onClick={toggleMobileFilter}
                className="rounded-full p-1 text-gray-600 hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>
          )}

          {/* Category Filter Section */}
          <div className="mb-6">
            <div 
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleSection('category')}
            >
              <h3 className="text-lg font-semibold">Category</h3>
              {expandedSections.category ? 
                <ChevronUp size={16} className="text-gray-600" /> : 
                <ChevronDown size={16} className="text-gray-600" />
              }
            </div>
            
            {expandedSections.category && (
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="category" 
                    value="all" 
                    checked={categoryFilter === 'all'} 
                    onChange={() => setCategoryFilter('all')}
                    className="form-radio text-gray-800"
                  />
                  <span>All</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="category" 
                    value="pet" 
                    checked={categoryFilter === 'pet'} 
                    onChange={() => setCategoryFilter('pet')}
                    className="form-radio text-gray-800"
                  />
                  <span>Pets</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="category" 
                    value="supplies" 
                    checked={categoryFilter === 'supplies'} 
                    onChange={() => setCategoryFilter('supplies')}
                    className="form-radio text-gray-800"
                  />
                  <span>Pet Supplies/Items</span>
                </label>
              </div>
            )}
          </div>
          
          {/* Pet Filters - Only show when Pets category is selected */}
          {(categoryFilter === 'pet' || categoryFilter === 'all') && (
            <div className="mb-6">
              <div 
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => toggleSection('petFilters')}
              >
                <h3 className="text-lg font-semibold">Pet Type</h3>
                {expandedSections.petFilters ? 
                  <ChevronUp size={16} className="text-gray-600" /> : 
                  <ChevronDown size={16} className="text-gray-600" />
                }
              </div>
              
              {expandedSections.petFilters && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="petType" 
                        value="all" 
                        checked={petTypeFilter === 'all'} 
                        onChange={() => {
                          setPetTypeFilter('all');
                          setBreedFilter('all');
                        }}
                        className="form-radio text-gray-800"
                      />
                      <span>All Pets</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="petType" 
                        value="dog" 
                        checked={petTypeFilter === 'dog'} 
                        onChange={() => {
                          setPetTypeFilter('dog');
                          setBreedFilter('all');
                        }}
                        className="form-radio text-gray-800"
                      />
                      <span>Dogs</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        name="petType" 
                        value="cat" 
                        checked={petTypeFilter === 'cat'} 
                        onChange={() => {
                          setPetTypeFilter('cat');
                          setBreedFilter('all');
                        }}
                        className="form-radio text-gray-800"
                      />
                      <span>Cats</span>
                    </label>
                  </div>
                  
                  {/* Breed Filter - Only show when dog or cat is selected */}
                  {petTypeFilter !== 'all' && (
                    <div className="mt-4">
                      <h4 className="text-md font-medium mb-2">Breed</h4>
                      <select 
                        value={breedFilter} 
                        onChange={(e) => setBreedFilter(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="all">All Breeds</option>
                        {getBreedsList().map(breed => (
                          <option key={breed} value={breed}>{breed}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Sort By Filter */}
          <div className="mb-6">
            <div 
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleSection('sort')}
            >
              <h3 className="text-lg font-semibold">Sort By</h3>
              {expandedSections.sort ? 
                <ChevronUp size={16} className="text-gray-600" /> : 
                <ChevronDown size={16} className="text-gray-600" />
              }
            </div>
            
            {expandedSections.sort && (
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            )}
          </div>
          
          {/* Price Range Filter */}
          <div className="mb-6">
            <div 
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleSection('price')}
            >
              <h3 className="text-lg font-semibold">Price Range</h3>
              {expandedSections.price ? 
                <ChevronUp size={16} className="text-gray-600" /> : 
                <ChevronDown size={16} className="text-gray-600" />
              }
            </div>
            
            {expandedSections.price && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">R {priceRange[0]}</span>
                  <span className="text-sm text-gray-600">R {priceRange[1]}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 block">Min</label>
                    <input 
                      type="number" 
                      min="0" 
                      max={priceRange[1]} 
                      value={priceRange[0]} 
                      onChange={(e) => handleRangeChange(e, 0)}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block">Max</label>
                    <input 
                      type="number" 
                      min={priceRange[0]} 
                      max="10000" 
                      value={priceRange[1]} 
                      onChange={(e) => handleRangeChange(e, 1)}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Location Filter */}
          <div className="mb-6">
            <div 
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleSection('location')}
            >
              <h3 className="text-lg font-semibold">Location</h3>
              {expandedSections.location ? 
                <ChevronUp size={16} className="text-gray-600" /> : 
                <ChevronDown size={16} className="text-gray-600" />
              }
            </div>
            
            {expandedSections.location && (
              <select 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="all">All Locations</option>
                <option value="Cape Town">Cape Town</option>
                <option value="Johannesburg">Johannesburg</option>
                <option value="Durban">Durban</option>
                <option value="Pretoria">Pretoria</option>
              </select>
            )}
          </div>
          
          {/* Apply Filters Button - Mobile Only */}
          {isMobileFilterOpen && (
            <button 
              onClick={toggleMobileFilter}
              className="w-full py-2 px-4 rounded mt-4 md:hidden"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              Apply Filters
            </button>
          )}
        </div>
        
        {/* Product Grid */}
        <div className="w-full">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-xl text-gray-500">Loading products...</div>
            </div>
          ) : (
            <>
              <div className="mb-4 text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} found
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="flex justify-center items-center h-64 border border-gray-200 rounded-lg">
                  <div className="text-center p-8">
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No products found</h3>
                    <p className="text-gray-500">Try adjusting your filters to find what you're looking for</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map(product => (
                    <div 
                      key={product.id} 
                      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="h-48 bg-gray-200 relative">
                        {/* This would be an image in the real implementation */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                          {product.image ? (
                            <img 
                              src="/api/placeholder/400/320" 
                              alt={product.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            "Product Image"
                          )}
                        </div>
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 text-xs rounded bg-white shadow-sm">
                            {product.category === 'pet' ? 'Pet' : 'Supplies'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">{product.location}</span>
                          {product.category === 'pet' && (
                            <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {product.petType === 'dog' ? 'Dog' : 'Cat'} {product.breed}
                            </span>
                          )}
                        </div>
                        <div className="pt-2 border-t border-gray-100 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">R {product.price.toLocaleString()}</span>
                            <button 
                              className="px-3 py-1 rounded text-sm"
                              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;