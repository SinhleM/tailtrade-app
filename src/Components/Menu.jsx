import React, { useState, useEffect, useMemo } from 'react';
import { Filter, X, ChevronDown, ChevronUp, AlertTriangle, ShoppingBag } from 'lucide-react'; // Added AlertTriangle, ShoppingBag
import { useSearchParams, useNavigate, Link } from 'react-router-dom'; // Added Link
import Header from './Header';
import Footer from './Footer'

// Menu component: Displays listings (pets and supplies) with filtering and sorting capabilities.
const Menu = () => {
  // Hooks for managing URL search parameters and navigation.
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate(); 

  // State for mobile filter panel visibility.
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  // State to store all fetched products/listings.
  const [allListings, setAllListings] = useState([]);
  // State for loading status.
  const [loading, setLoading] = useState(true);
  // State for error messages during data fetching.
  const [error, setError] = useState(null);
  // State for the current search query term.
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // --- Filter States ---
  // Initialize filter states from URL parameters or use defaults.
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all'); // 'all', 'pet', 'supply'
  const [petTypeFilter, setPetTypeFilter] = useState(searchParams.get('petType') || 'all'); // 'all', 'dog', 'cat' (applies if category is 'pet')
  const [breedFilter, setBreedFilter] = useState(searchParams.get('breed') || 'all'); // Specific breed (applies if petType is selected)
  const [supplyConditionFilter, setSupplyConditionFilter] = useState(searchParams.get('condition') || 'all'); // 'all', 'new', 'like-new', etc. (applies if category is 'supply')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest'); // 'newest', 'oldest', 'price-low', 'price-high'
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get('minPrice') || 0),
    parseInt(searchParams.get('maxPrice') || 50000) // Increased max default
  ]);
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || 'all');

  // State for collapsible sections in the filter panel.
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    petFilters: true,
    supplyFilters: true,
    sort: true,
    price: true,
    location: true
  });

  // Toggles the expansion state of a filter section.
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Effect to fetch listings from the backend when the component mounts.
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost/PET-C2C-PROJECT/TailTrade/Backend/Get_All_Listings.php')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Transform fetched data for consistency and usability.
          const formattedData = data.listings.map(item => ({
            ...item,
            // Standardize 'category' based on 'listing_type' from backend.
            category: item.listing_type, // 'pet' or 'supply'
            // Ensure 'date' is a Date object for correct sorting.
            date: new Date(item.created_at),
            // Ensure price is a number.
            price: parseFloat(item.price)
          }));
          setAllListings(formattedData);
        } else {
          setError(data.message || 'Failed to fetch listings.');
          setAllListings([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching listings:', err);
        setError(`Network error or server issue: ${err.message}. Please ensure the backend is running and accessible.`);
        setAllListings([]);
        setLoading(false);
      });
  }, []);


  // Effect to update the search query state when the URL 'search' parameter changes.
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Effect to update URL search parameters whenever a filter state changes.
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);

    if (categoryFilter === 'pet' || categoryFilter === 'all') { // Only add pet-specific filters if relevant
        if (petTypeFilter !== 'all') params.set('petType', petTypeFilter);
        if (petTypeFilter !== 'all' && breedFilter !== 'all') params.set('breed', breedFilter);
    }
    if (categoryFilter === 'supply' || categoryFilter === 'all') { // Only add supply-specific filters if relevant
        if (supplyConditionFilter !== 'all') params.set('condition', supplyConditionFilter);
    }

    if (sortBy !== 'newest') params.set('sortBy', sortBy);
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
    if (priceRange[1] < 50000) params.set('maxPrice', String(priceRange[1])); // Use the same max as default
    if (locationFilter !== 'all') params.set('location', locationFilter);

    // Update URL without navigating, preserving history.
    setSearchParams(params, { replace: true });
  }, [searchQuery, categoryFilter, petTypeFilter, breedFilter, supplyConditionFilter, sortBy, priceRange, locationFilter, setSearchParams]);


  // Memoized calculation for filtered and sorted products.
  // This recalculates only when its dependencies change.
  const processedListings = useMemo(() => {
    let filtered = allListings.filter(listing => {
      // Search query filter (checks name, description, breed, type)
      if (searchQuery) {
        const lowerSearchQuery = searchQuery.toLowerCase();
        const inName = listing.name && listing.name.toLowerCase().includes(lowerSearchQuery);
        const inDescription = listing.description && listing.description.toLowerCase().includes(lowerSearchQuery);
        const inBreed = listing.breed && listing.breed.toLowerCase().includes(lowerSearchQuery);
        const inType = listing.type && listing.type.toLowerCase().includes(lowerSearchQuery); // For pet type 'dog'/'cat'
        const inListingType = listing.listing_type && listing.listing_type.toLowerCase().includes(lowerSearchQuery); // 'pet' or 'supply'

        if (!(inName || inDescription || inBreed || inType || inListingType)) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && listing.category !== categoryFilter) return false;

      // Pet-specific filters (only if category is 'pet' or 'all')
      if (listing.category === 'pet') {
        if (petTypeFilter !== 'all' && listing.type !== petTypeFilter) return false;
        if (petTypeFilter !== 'all' && breedFilter !== 'all' && listing.breed !== breedFilter) return false;
      }

      // Supply-specific filters (only if category is 'supply' or 'all')
      if (listing.category === 'supply') {
         if (supplyConditionFilter !== 'all' && listing.condition !== supplyConditionFilter) return false;
      }

      // Price range filter
      if (listing.price < priceRange[0] || listing.price > priceRange[1]) return false;

      // Location filter
      if (locationFilter !== 'all' && listing.location !== locationFilter) return false;

      return true;
    });

    // Sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest': return b.date - a.date;
        case 'oldest': return a.date - b.date;
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        default: return 0;
      }
    });
  }, [allListings, searchQuery, categoryFilter, petTypeFilter, breedFilter, supplyConditionFilter, sortBy, priceRange, locationFilter]);


  // --- Dynamic options for filters ---
  const locations = useMemo(() => ['all', ...new Set(allListings.map(p => p.location).filter(Boolean))], [allListings]);
  const breeds = useMemo(() => {
    if (petTypeFilter === 'all') return ['all']; // Show only 'all' if no specific pet type
    return ['all', ...new Set(allListings.filter(p => p.category === 'pet' && p.type === petTypeFilter).map(p => p.breed).filter(Boolean))];
  }, [allListings, petTypeFilter]);
  const conditions = useMemo(() => ['all', 'new', 'like-new', 'good', 'fair', 'used'], []);


  // Handlers for filter changes
  const handlePriceRangeChange = (e, index) => {
    const value = parseInt(e.target.value, 10);
    const newRange = [...priceRange];
    newRange[index] = isNaN(value) ? (index === 0 ? 0 : 50000) : value; // Ensure valid numbers

    // Prevent minPrice from exceeding maxPrice and vice-versa
    if (index === 0 && newRange[0] > newRange[1]) newRange[0] = newRange[1];
    if (index === 1 && newRange[1] < newRange[0]) newRange[1] = newRange[0];

    setPriceRange(newRange);
  };

  // Toggle mobile filter panel.
  const toggleMobileFilter = () => setIsMobileFilterOpen(!isMobileFilterOpen);
  
  // Handler for navigating to listing detail
  const handleListingClick = (listing) => {
    navigate(`/listing/${listing.listing_type}/${listing.id}`);
  };

  // --- Render Logic ---
  return (
    <>
      <Header /> {/* Include the Header component */}
      <div className="container mx-auto px-4 py-8 font-inter">
        {/* Page Title and Mobile Filter Button */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Browse Listings</h1>
            <div className="md:hidden">
                <button
                    onClick={toggleMobileFilter}
                    className="flex items-center justify-center py-2 px-4 rounded-md text-white shadow-md hover:shadow-lg transition-shadow"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    <Filter size={18} className="mr-2" />
                    Filters ({processedListings.length})
                </button>
            </div>
        </div>


        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Panel */}
          <aside className={`${isMobileFilterOpen ? 'fixed inset-0 z-40 overflow-y-auto bg-white p-6 w-full' : 'hidden'} md:block md:relative md:w-72 md:z-auto md:p-0 md:bg-transparent`}>
            {isMobileFilterOpen && (
              <div className="flex justify-between items-center md:hidden mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-700">Filters</h3>
                <button onClick={toggleMobileFilter} className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={28} />
                </button>
              </div>
            )}

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 cursor-pointer flex justify-between items-center" onClick={() => toggleSection('category')}>
                Category {expandedSections.category ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </h3>
              {expandedSections.category && (
                <div className="space-y-2 pl-2">
                  {['all', 'pet', 'supply'].map(cat => (
                    <label key={cat} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 cursor-pointer">
                      <input type="radio" name="category" value={cat} checked={categoryFilter === cat} onChange={(e) => {setCategoryFilter(e.target.value); setPetTypeFilter('all'); setBreedFilter('all'); setSupplyConditionFilter('all');}} className="form-radio h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"/>
                      <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Pet Specific Filters */}
            {(categoryFilter === 'pet' || categoryFilter === 'all') && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-700 cursor-pointer flex justify-between items-center" onClick={() => toggleSection('petFilters')}>
                  Pet Filters {expandedSections.petFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </h3>
                {expandedSections.petFilters && (
                  <div className="space-y-4 pl-2">
                    <div>
                      <label htmlFor="petTypeFilter" className="block text-sm font-medium text-gray-500 mb-1">Pet Type</label>
                      <select id="petTypeFilter" value={petTypeFilter} onChange={(e) => {setPetTypeFilter(e.target.value); setBreedFilter('all');}} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-orange-500 focus:border-orange-500">
                        {['all', 'dog', 'cat'].map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                      </select>
                    </div>
                    {petTypeFilter !== 'all' && breeds.length > 1 && (
                      <div>
                        <label htmlFor="breedFilter" className="block text-sm font-medium text-gray-500 mb-1">Breed</label>
                        <select id="breedFilter" value={breedFilter} onChange={(e) => setBreedFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-orange-500 focus:border-orange-500">
                          {breeds.map(breed => <option key={breed} value={breed}>{breed.charAt(0).toUpperCase() + breed.slice(1)}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Supply Specific Filters */}
            {(categoryFilter === 'supply' || categoryFilter === 'all') && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700 cursor-pointer flex justify-between items-center" onClick={() => toggleSection('supplyFilters')}>
                        Supply Filters {expandedSections.supplyFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </h3>
                    {expandedSections.supplyFilters && (
                        <div className="space-y-4 pl-2">
                            <div>
                                <label htmlFor="supplyConditionFilter" className="block text-sm font-medium text-gray-500 mb-1">Condition</label>
                                <select id="supplyConditionFilter" value={supplyConditionFilter} onChange={(e) => setSupplyConditionFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-orange-500 focus:border-orange-500">
                                    {conditions.map(cond => <option key={cond} value={cond}>{cond.charAt(0).toUpperCase() + cond.slice(1).replace('-', ' ')}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            )}


            {/* Sort By Filter */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 cursor-pointer flex justify-between items-center" onClick={() => toggleSection('sort')}>
                Sort By {expandedSections.sort ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </h3>
              {expandedSections.sort && (
                <div className="pl-2">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-orange-500 focus:border-orange-500">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              )}
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 cursor-pointer flex justify-between items-center" onClick={() => toggleSection('price')}>
                Price Range {expandedSections.price ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </h3>
              {expandedSections.price && (
                <div className="space-y-3 pl-2">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>R {priceRange[0]}</span>
                    <span>R {priceRange[1]}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="minPrice" className="block text-xs font-medium text-gray-500 mb-1">Min</label>
                      <input id="minPrice" type="number" min="0" max={priceRange[1]} value={priceRange[0]} onChange={(e) => handlePriceRangeChange(e, 0)} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"/>
                    </div>
                    <div>
                      <label htmlFor="maxPrice" className="block text-xs font-medium text-gray-500 mb-1">Max</label>
                      <input id="maxPrice" type="number" min={priceRange[0]} max="50000" value={priceRange[1]} onChange={(e) => handlePriceRangeChange(e, 1)} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"/>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Location Filter */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 cursor-pointer flex justify-between items-center" onClick={() => toggleSection('location')}>
                Location {expandedSections.location ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </h3>
              {expandedSections.location && locations.length > 0 && (
                <div className="pl-2">
                  <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-orange-500 focus:border-orange-500">
                    {locations.map(loc => <option key={loc} value={loc}>{loc === 'all' ? 'All Locations' : loc}</option>)}
                  </select>
                </div>
              )}
            </div>

            {isMobileFilterOpen && (
              <button onClick={toggleMobileFilter} className="w-full mt-6 py-3 px-4 rounded-md text-white font-semibold shadow-md hover:shadow-lg transition-shadow" style={{ backgroundColor: 'var(--color-primary)' }}>
                Apply Filters & View ({processedListings.length})
              </button>
            )}
          </aside>

          {/* Listings Grid */}
          <main className="w-full">
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                <p className="ml-3 text-lg text-gray-600">Loading listings...</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-md flex items-center">
                <AlertTriangle size={24} className="mr-3 text-red-500" />
                <div>
                    <p className="font-semibold">Error loading listings</p>
                    <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            {!loading && !error && (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {processedListings.length} {processedListings.length === 1 ? 'result' : 'results'}.
                  {searchQuery && <span> Searched for: "{searchQuery}"</span>}
                </div>
                {processedListings.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-80 border border-gray-200 rounded-lg bg-gray-50 p-8 text-center shadow">
                    <ShoppingBag size={48} className="text-gray-400 mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Listings Found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setCategoryFilter('all');
                            setPetTypeFilter('all');
                            setBreedFilter('all');
                            setSupplyConditionFilter('all');
                            setPriceRange([0, 50000]);
                            setLocationFilter('all');
                            setSortBy('newest');
                        }}
                        className="mt-6 px-6 py-2 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                        Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {processedListings.map(listing => (
                      <div 
                        key={listing.id + listing.listing_type} 
                        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col bg-white transform hover:scale-[1.03] cursor-pointer"
                        onClick={() => navigate(`/listing/${listing.listing_type}/${listing.id}`)}
                      >
                        <div className="h-40 sm:h-56 bg-gray-100 relative overflow-hidden">
                          <img
                            src={listing.image_url || `https://placehold.co/400x320/E2E8F0/AAAAAA?text=${listing.name.split(' ')[0]}`}
                            alt={listing.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/400x320/E2E8F0/AAAAAA?text=Image+Not+Found`; }}
                          />
                          <div className="absolute top-2 left-2">
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full shadow-md capitalize"
                                  style={{
                                    backgroundColor: listing.category === 'pet' ? 'rgba(255, 122, 89, 0.8)' : 'rgba(59, 130, 246, 0.8)', /* --color-primary or a blue for supplies */
                                    color: 'white',
                                    backdropFilter: 'blur(2px)'
                                  }}>
                            {listing.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 sm:p-4 flex flex-col flex-grow">
                          <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-800 truncate" title={listing.name}>{listing.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1 capitalize">
                            {listing.location}
                          </p>
                          {listing.category === 'pet' && listing.breed && (
                            <p className="text-xs text-gray-500 mb-2 capitalize bg-gray-100 px-2 py-0.5 rounded-full self-start">{listing.breed}</p>
                          )}
                          {listing.category === 'supply' && listing.condition && (
                            <p className="text-xs text-gray-500 mb-2 capitalize bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full self-start">{listing.condition.replace('-', ' ')}</p>
                          )}
                          <div className="mt-auto pt-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-base sm:text-xl text-gray-800">R {listing.price.toLocaleString()}</span>
                              <button 
                                className="px-2 py-1 sm:px-4 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium text-white shadow hover:shadow-md transition-shadow" 
                                style={{ backgroundColor: 'var(--color-primary)'}}>
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
          </main>
        </div>
      </div>
      
    </>
  );
};

export default Menu;