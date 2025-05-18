import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Filter, X, ChevronDown, ChevronUp, AlertTriangle, ShoppingBag, Heart } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // --- New Filter States (using objects for checkbox selections) ---
  const initialCategorySelection = () => {
    const catParam = searchParams.get('category');
    const initial = { pet: false, supply: false };
    if (catParam) {
      catParam.split(',').forEach(cat => {
        if (cat in initial) initial[cat] = true;
      });
    }
    return initial;
  };
  const [categorySelection, setCategorySelection] = useState(initialCategorySelection);

  const initialPetTypeSelection = () => {
    const petTypeParam = searchParams.get('petType');
    const initial = { dog: false, cat: false }; // Add more pet types if needed
    if (petTypeParam) {
      petTypeParam.split(',').forEach(type => {
        if (type in initial) initial[type] = true;
      });
    }
    return initial;
  };
  const [petTypeSelection, setPetTypeSelection] = useState(initialPetTypeSelection);

  // Define available conditions (excluding 'all' for checkbox keys)
  const availableConditions = useMemo(() => ['new', 'like-new', 'good', 'fair', 'used'], []);

  const initialSupplyConditionSelection = () => {
    const conditionParam = searchParams.get('condition');
    const initial = availableConditions.reduce((acc, cond) => {
      acc[cond] = false;
      return acc;
    }, {});
    if (conditionParam) {
      conditionParam.split(',').forEach(cond => {
        if (cond in initial) initial[cond] = true;
      });
    }
    return initial;
  };
  const [supplyConditionSelection, setSupplyConditionSelection] = useState(initialSupplyConditionSelection);

  // --- Existing Filter States (some may need adjustments in how they are reset) ---
  const [breedFilter, setBreedFilter] = useState(searchParams.get('breed') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get('minPrice') || 0),
    parseInt(searchParams.get('maxPrice') || 50000)
  ]);
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || 'all');

  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('userFavorites');
    return savedFavorites ? new Set(JSON.parse(savedFavorites)) : new Set();
  });
  const [showFavoritesFilter, setShowFavoritesFilter] = useState(searchParams.get('showFavorites') === 'true' || false);

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    petFilters: true,
    supplyFilters: true,
    sort: true,
    price: true,
    location: true,
    favoritesFilterSection: true
  });

  const [scrollPosition, setScrollPosition] = useState(0);
  const headerRef = useRef(null);
  const [visibleImages, setVisibleImages] = useState(new Set());

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost/PET-C2C-PROJECT/TailTrade/Backend/Get_All_Listings.php')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (data.success) {
          const formattedData = data.listings.map(item => ({
            ...item,
            category: item.listing_type, // 'pet' or 'supply'
            type: item.type, // 'dog', 'cat' for pets
            date: new Date(item.created_at),
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

  useEffect(() => {
    localStorage.setItem('userFavorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Effect to update URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);

    const selectedCats = Object.entries(categorySelection).filter(([, v]) => v).map(([k]) => k);
    if (selectedCats.length > 0) params.set('category', selectedCats.join(','));

    const activeCategories = Object.keys(categorySelection).filter(key => categorySelection[key]);
    const showPetSpecificFilters = categorySelection.pet || activeCategories.length === 0;
    const showSupplySpecificFilters = categorySelection.supply || activeCategories.length === 0;

    if (showPetSpecificFilters) {
      const selectedPetTypes = Object.entries(petTypeSelection).filter(([, v]) => v).map(([k]) => k);
      if (selectedPetTypes.length > 0) params.set('petType', selectedPetTypes.join(','));
      if (selectedPetTypes.length === 1 && breedFilter !== 'all') params.set('breed', breedFilter); // Breed filter only if one pet type selected
    }

    if (showSupplySpecificFilters) {
      const selectedConditions = Object.entries(supplyConditionSelection).filter(([, v]) => v).map(([k]) => k);
      if (selectedConditions.length > 0) params.set('condition', selectedConditions.join(','));
    }

    if (sortBy !== 'newest') params.set('sortBy', sortBy);
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
    if (priceRange[1] < 50000) params.set('maxPrice', String(priceRange[1]));
    if (locationFilter !== 'all') params.set('location', locationFilter);
    if (showFavoritesFilter) params.set('showFavorites', 'true');

    setSearchParams(params, { replace: true });
  }, [
    searchQuery, categorySelection, petTypeSelection, breedFilter,
    supplyConditionSelection, sortBy, priceRange, locationFilter,
    showFavoritesFilter, setSearchParams
  ]);

  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const processedListings = useMemo(() => {
    let listingsToProcess = [...allListings];

    if (showFavoritesFilter) {
      listingsToProcess = listingsToProcess.filter(listing => favorites.has(listing.id + listing.listing_type));
    }

    let filtered = listingsToProcess.filter(listing => {
      if (searchQuery) {
        const lowerSearchQuery = searchQuery.toLowerCase();
        const inName = listing.name && listing.name.toLowerCase().includes(lowerSearchQuery);
        const inDescription = listing.description && listing.description.toLowerCase().includes(lowerSearchQuery);
        const inBreed = listing.breed && listing.breed.toLowerCase().includes(lowerSearchQuery);
        const inType = listing.type && listing.type.toLowerCase().includes(lowerSearchQuery); // For pet type
        const inListingType = listing.listing_type && listing.listing_type.toLowerCase().includes(lowerSearchQuery); // For category
        if (!(inName || inDescription || inBreed || inType || inListingType)) return false;
      }

      const activeCatFilters = Object.keys(categorySelection).filter(key => categorySelection[key]);
      if (activeCatFilters.length > 0 && !activeCatFilters.includes(listing.category)) return false;

      if (listing.category === 'pet') {
        const activePetTypeFilters = Object.keys(petTypeSelection).filter(key => petTypeSelection[key]);
        if (activePetTypeFilters.length > 0 && !activePetTypeFilters.includes(listing.type)) return false;
        if (activePetTypeFilters.length === 1 && breedFilter !== 'all' && listing.breed !== breedFilter) return false;
      }

      if (listing.category === 'supply') {
        const activeConditionFilters = Object.keys(supplyConditionSelection).filter(key => supplyConditionSelection[key]);
        if (activeConditionFilters.length > 0 && !activeConditionFilters.includes(listing.condition)) return false;
      }

      if (listing.price < priceRange[0] || listing.price > priceRange[1]) return false;
      if (locationFilter !== 'all' && listing.location !== locationFilter) return false;

      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest': return b.date - a.date;
        case 'oldest': return a.date - b.date;
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        default: return 0;
      }
    });
  }, [
    allListings, searchQuery, categorySelection, petTypeSelection, breedFilter,
    supplyConditionSelection, sortBy, priceRange, locationFilter, showFavoritesFilter, favorites
  ]);

  useEffect(() => {
    const imgObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const imageId = entry.target.dataset.imageId;
            setVisibleImages(prev => new Set(prev).add(imageId));
            imgObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px' }
    );
    document.querySelectorAll('.lazy-image-container').forEach(img => imgObserver.observe(img));
    return () => imgObserver.disconnect();
  }, [processedListings]);

  const toggleFavorite = (listingId) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(listingId)) newFavorites.delete(listingId);
      else newFavorites.add(listingId);
      return newFavorites;
    });
  };

  const locations = useMemo(() => ['all', ...new Set(allListings.map(p => p.location).filter(Boolean))], [allListings]);

  const breeds = useMemo(() => {
    const selectedPetTypes = Object.keys(petTypeSelection).filter(pt => petTypeSelection[pt]);
    if (selectedPetTypes.length === 1) {
      const currentPetType = selectedPetTypes[0];
      return ['all', ...new Set(allListings
        .filter(p => p.category === 'pet' && p.type === currentPetType && p.breed)
        .map(p => p.breed)
      )];
    }
    return ['all'];
  }, [allListings, petTypeSelection]);

  // Effect to reset breedFilter if petTypeSelection changes invalidating current breed, or if breeds list changes
   useEffect(() => {
    const selectedPetTypes = Object.keys(petTypeSelection).filter(pt => petTypeSelection[pt]);
    const currentBreedsList = breeds; // Get the current list based on petTypeSelection

    if (selectedPetTypes.length !== 1 && breedFilter !== 'all') {
        setBreedFilter('all');
    } else if (selectedPetTypes.length === 1 && !currentBreedsList.includes(breedFilter)) {
        setBreedFilter('all');
    }
  }, [petTypeSelection, breedFilter, breeds]); // breeds itself is derived from allListings & petTypeSelection

  // Static list for supply conditions for UI mapping (keys are in availableConditions)
  const supplyConditionOptions = useMemo(() => ['new', 'like-new', 'good', 'fair', 'used'], []);


  const handlePriceRangeChange = (e, index) => {
    const value = parseInt(e.target.value, 10);
    const newRange = [...priceRange];
    newRange[index] = isNaN(value) ? (index === 0 ? 0 : 50000) : value;
    if (index === 0 && newRange[0] > newRange[1]) newRange[0] = newRange[1];
    if (index === 1 && newRange[1] < newRange[0]) newRange[1] = newRange[0];
    setPriceRange(newRange);
  };

  const toggleMobileFilter = () => setIsMobileFilterOpen(!isMobileFilterOpen);

  const activeCategoriesForVisibility = Object.keys(categorySelection).filter(key => categorySelection[key]);
  const showPetFiltersSection = categorySelection.pet || activeCategoriesForVisibility.length === 0;
  const showSupplyFiltersSection = categorySelection.supply || activeCategoriesForVisibility.length === 0;

  // Function to reset all pet type selections
  const resetPetTypeSelection = () => {
    setPetTypeSelection(prev => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}));
  };

  // Function to reset all supply condition selections
  const resetSupplyConditionSelection = () => {
    setSupplyConditionSelection(prev => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}));
  };

  return (
    <>
      <Header ref={headerRef} />
      <div className="container mx-auto px-4 py-8 font-inter">
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
          <aside className={`${isMobileFilterOpen ? 'fixed inset-0 z-40 overflow-y-auto bg-white p-6 w-full' : 'hidden'} md:block md:relative md:w-72 md:z-30`}>
            <div
              className={`md:sticky transition-all duration-200 overflow-y-auto`}
              style={{
                top: scrollPosition > (headerRef.current?.offsetHeight || 0) ? '1rem' : `${(headerRef.current?.offsetHeight || 0) + 16}px`,
                maxHeight: `calc(100vh - ${scrollPosition > (headerRef.current?.offsetHeight || 0) ? '2rem' : `${(headerRef.current?.offsetHeight || 0) + 32}px`})`
              }}
            >
              {isMobileFilterOpen && (
                <div className="flex justify-between items-center md:hidden mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-2xl font-semibold text-gray-700">Filters</h3>
                  <button onClick={toggleMobileFilter} className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={28} />
                  </button>
                </div>
              )}

              {/* Category Filter */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-700 cursor-pointer flex justify-between items-center" onClick={() => toggleSection('category')}>
                  Category {expandedSections.category ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </h3>
                {expandedSections.category && (
                  <div className="space-y-1">
                    {['pet', 'supply'].map(cat => (
                      <label key={cat} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 rounded-md transition-colors">
                        <input
                          type="checkbox"
                          checked={categorySelection[cat] || false}
                          onChange={(e) => {
                            const newSelection = { ...categorySelection, [cat]: e.target.checked };
                            setCategorySelection(newSelection);
                            if (cat === 'pet' && !e.target.checked) {
                              resetPetTypeSelection(); // Reset pet types
                              setBreedFilter('all');   // Reset breed
                            }
                            if (cat === 'supply' && !e.target.checked) {
                              resetSupplyConditionSelection(); // Reset conditions
                            }
                          }}
                          className="form-checkbox h-5 w-5 text-orange-500 rounded border-gray-300 focus:ring-orange-400 focus:ring-offset-0 transition-colors"
                        />
                        <span className="text-sm text-gray-700">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Favorites Filter */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-700 cursor-pointer flex justify-between items-center" onClick={() => toggleSection('favoritesFilterSection')}>
                  Filter by Favorites {expandedSections.favoritesFilterSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </h3>
                {expandedSections.favoritesFilterSection && (
                  <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 rounded-md transition-colors">
                    <input
                      type="checkbox"
                      checked={showFavoritesFilter}
                      onChange={(e) => setShowFavoritesFilter(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-orange-500 rounded border-gray-300 focus:ring-orange-400 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-700">Show Only My Favorites</span>
                  </label>
                )}
              </div>

              {/* Pet Filters */}
              {showPetFiltersSection && (
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700 cursor-pointer flex justify-between items-center" onClick={() => toggleSection('petFilters')}>
                    Pet Filters {expandedSections.petFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </h3>
                  {expandedSections.petFilters && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Pet Type</label>
                        <div className="space-y-1">
                          {Object.keys(petTypeSelection).map(type => (
                            <label key={type} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 rounded-md transition-colors">
                              <input
                                type="checkbox"
                                checked={petTypeSelection[type] || false}
                                onChange={(e) => {
                                  setPetTypeSelection(prev => ({ ...prev, [type]: e.target.checked }));
                                  // Breed filter reset is handled by the useEffect watching petTypeSelection & breeds
                                }}
                                className="form-checkbox h-5 w-5 text-orange-500 rounded border-gray-300 focus:ring-orange-400 focus:ring-offset-0 transition-colors"
                              />
                              <span className="text-sm text-gray-700">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      { (Object.values(petTypeSelection).filter(v => v).length === 1 || breeds.length > 1) && breeds.length > 1 && (
                        <div>
                          <label htmlFor="breedFilter" className="block text-sm font-medium text-gray-500 mb-1">Breed</label>
                          <select
                            id="breedFilter"
                            value={breedFilter}
                            onChange={(e) => setBreedFilter(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-orange-500 focus:border-orange-500"
                            disabled={Object.values(petTypeSelection).filter(v => v).length !== 1} // Disable if not exactly one pet type selected
                          >
                            {breeds.map(breed => <option key={breed} value={breed}>{breed.charAt(0).toUpperCase() + breed.slice(1)}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Supply Filters */}
              {showSupplyFiltersSection && (
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700 cursor-pointer flex justify-between items-center" onClick={() => toggleSection('supplyFilters')}>
                    Supply Filters {expandedSections.supplyFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </h3>
                  {expandedSections.supplyFilters && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Condition</label>
                      <div className="space-y-1">
                        {supplyConditionOptions.map(cond => (
                          <label key={cond} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 rounded-md transition-colors">
                            <input
                              type="checkbox"
                              checked={supplyConditionSelection[cond] || false}
                              onChange={(e) => {
                                setSupplyConditionSelection(prev => ({...prev, [cond]: e.target.checked}));
                              }}
                              className="form-checkbox h-5 w-5 text-orange-500 rounded border-gray-300 focus:ring-orange-400 focus:ring-offset-0 transition-colors"
                            />
                            <span className="text-sm text-gray-700">{cond.charAt(0).toUpperCase() + cond.slice(1).replace('-', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sort Filter */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-700 cursor-pointer flex justify-between items-center" onClick={() => toggleSection('sort')}>
                  Sort By {expandedSections.sort ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </h3>
                {expandedSections.sort && (
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-orange-500 focus:border-orange-500">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-700 cursor-pointer flex justify-between items-center" onClick={() => toggleSection('price')}>
                  Price Range {expandedSections.price ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </h3>
                {expandedSections.price && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>R {priceRange[0]}</span>
                      <span>R {priceRange[1]}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Min</label>
                        <input type="number" value={priceRange[0]} onChange={(e) => handlePriceRangeChange(e, 0)} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Max</label>
                        <input type="number" value={priceRange[1]} onChange={(e) => handlePriceRangeChange(e, 1)} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Location Filter */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-700 cursor-pointer flex justify-between items-center" onClick={() => toggleSection('location')}>
                  Location {expandedSections.location ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </h3>
                {expandedSections.location && locations.length > 0 && (
                  <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-orange-500 focus:border-orange-500">
                    {locations.map(loc => <option key={loc} value={loc}>{loc === 'all' ? 'All Locations' : loc}</option>)}
                  </select>
                )}
              </div>

              {isMobileFilterOpen && (
                <button onClick={toggleMobileFilter} className="w-full mt-6 py-3 px-4 rounded-md text-white font-semibold shadow-md hover:shadow-lg transition-shadow" style={{ backgroundColor: 'var(--color-primary)' }}>
                  Apply Filters & View ({processedListings.length})
                </button>
              )}
            </div>
          </aside>

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
                  {showFavoritesFilter && <span className="ml-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">Showing Favorites</span>}
                </div>
                {processedListings.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-80 border border-gray-200 rounded-lg bg-gray-50 p-8 text-center shadow">
                    <ShoppingBag size={48} className="text-gray-400 mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Listings Found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCategorySelection({ pet: false, supply: false });
                        setPetTypeSelection({ dog: false, cat: false });
                        setBreedFilter('all');
                        setSupplyConditionSelection(availableConditions.reduce((acc, cond) => ({ ...acc, [cond]: false }), {}));
                        setPriceRange([0, 50000]);
                        setLocationFilter('all');
                        setSortBy('newest');
                        setShowFavoritesFilter(false);
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
                        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col bg-white group"
                      >
                        <div
                          className="h-40 sm:h-56 relative overflow-hidden cursor-pointer"
                          onClick={() => navigate(`/listing/${listing.listing_type}/${listing.id}`)}
                        >
                          <div
                            className="w-full h-full bg-gray-100 lazy-image-container"
                            data-image-id={`${listing.id}-${listing.listing_type}`}
                          >
                            {visibleImages.has(`${listing.id}-${listing.listing_type}`) ? (
                              <img
                                src={listing.image_url || `https://placehold.co/400x320/E2E8F0/AAAAAA?text=${listing.name.split(' ')[0]}`}
                                alt={listing.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x320/E2E8F0/AAAAAA?text=Image+Not+Found`; }}
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <div className="animate-pulse rounded-md bg-gray-300 w-full h-full"></div>
                              </div>
                            )}
                          </div>
                           <div className="absolute top-2 left-2">
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full shadow-md capitalize"
                              style={{
                                backgroundColor: listing.category === 'pet' ? 'rgba(255, 122, 89, 0.8)' : 'rgba(59, 130, 246, 0.8)',
                                color: 'white',
                                backdropFilter: 'blur(2px)'
                              }}>
                              {listing.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 sm:p-4 flex flex-col flex-grow">
                          <h3
                            className="font-semibold text-base sm:text-lg mb-1 text-gray-800 truncate cursor-pointer hover:text-orange-600"
                            title={listing.name}
                            onClick={() => navigate(`/listing/${listing.listing_type}/${listing.id}`)}
                          >
                            {listing.name}
                          </h3>
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
                              <span
                                className="font-bold text-base sm:text-xl text-gray-800 cursor-pointer"
                                onClick={() => navigate(`/listing/${listing.listing_type}/${listing.id}`)}
                              >
                                R {listing.price.toLocaleString()}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(listing.id + listing.listing_type);
                                }}
                                className={`p-2 rounded-full hover:bg-red-100 transition-colors focus:outline-none ${favorites.has(listing.id + listing.listing_type) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                                aria-label={favorites.has(listing.id + listing.listing_type) ? "Remove from favorites" : "Add to favorites"}
                              >
                                <Heart size={20} fill={favorites.has(listing.id + listing.listing_type) ? "currentColor" : "none"} />
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
    <Footer/>
    </>
  );
};

export default Menu;