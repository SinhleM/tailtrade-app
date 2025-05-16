import React, { useState, useEffect, useMemo, useRef } from 'react'; // Added useRef
import { Filter, X, ChevronDown, ChevronUp, AlertTriangle, ShoppingBag, Heart } from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

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
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [petTypeFilter, setPetTypeFilter] = useState(searchParams.get('petType') || 'all');
  const [breedFilter, setBreedFilter] = useState(searchParams.get('breed') || 'all');
  const [supplyConditionFilter, setSupplyConditionFilter] = useState(searchParams.get('condition') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get('minPrice') || 0),
    parseInt(searchParams.get('maxPrice') || 50000)
  ]);
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || 'all');

  // State for favorites
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('userFavorites');
    return savedFavorites ? new Set(JSON.parse(savedFavorites)) : new Set();
  });

  // State for "Show Favorites" filter
  const [showFavoritesFilter, setShowFavoritesFilter] = useState(searchParams.get('showFavorites') === 'true' || false);

  // State for collapsible sections in the filter panel.
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    petFilters: true,
    supplyFilters: true,
    sort: true,
    price: true,
    location: true,
    favoritesFilterSection: true
  });

  // 2. Add a new state to track scroll position
  const [scrollPosition, setScrollPosition] = useState(0);

  // 3. Add a ref for the header to measure its height
  const headerRef = useRef(null);

  // 4. Add a state for image lazy loading
  const [visibleImages, setVisibleImages] = useState(new Set());


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
          const formattedData = data.listings.map(item => ({
            ...item,
            category: item.listing_type,
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

  // Effect to update localStorage when favorites change
  useEffect(() => {
    localStorage.setItem('userFavorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  // Effect to update the search query state when the URL 'search' parameter changes.
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Effect to update URL search parameters whenever a filter state changes.
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);

    if (categoryFilter === 'pet' || categoryFilter === 'all') {
      if (petTypeFilter !== 'all') params.set('petType', petTypeFilter);
      if (petTypeFilter !== 'all' && breedFilter !== 'all') params.set('breed', breedFilter);
    }
    if (categoryFilter === 'supply' || categoryFilter === 'all') {
      if (supplyConditionFilter !== 'all') params.set('condition', supplyConditionFilter);
    }

    if (sortBy !== 'newest') params.set('sortBy', sortBy);
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
    if (priceRange[1] < 50000) params.set('maxPrice', String(priceRange[1]));
    if (locationFilter !== 'all') params.set('location', locationFilter);
    if (showFavoritesFilter) params.set('showFavorites', 'true');

    setSearchParams(params, { replace: true });
  }, [searchQuery, categoryFilter, petTypeFilter, breedFilter, supplyConditionFilter, sortBy, priceRange, locationFilter, showFavoritesFilter, setSearchParams]);


  // 5. Add a useEffect to handle scroll position and set up fixed sidebar
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Memoized calculation for filtered and sorted products.
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
        const inType = listing.type && listing.type.toLowerCase().includes(lowerSearchQuery);
        const inListingType = listing.listing_type && listing.listing_type.toLowerCase().includes(lowerSearchQuery);
        if (!(inName || inDescription || inBreed || inType || inListingType)) return false;
      }

      if (categoryFilter !== 'all' && listing.category !== categoryFilter) return false;

      if (listing.category === 'pet') {
        if (petTypeFilter !== 'all' && listing.type !== petTypeFilter) return false;
        if (petTypeFilter !== 'all' && breedFilter !== 'all' && listing.breed !== breedFilter) return false;
      }

      if (listing.category === 'supply') {
        if (supplyConditionFilter !== 'all' && listing.condition !== supplyConditionFilter) return false;
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
  }, [allListings, searchQuery, categoryFilter, petTypeFilter, breedFilter, supplyConditionFilter, sortBy, priceRange, locationFilter, showFavoritesFilter, favorites]);


  // 6. Add useEffect for lazy loading images with Intersection Observer
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
      { rootMargin: '200px' } // Start loading images when they're within 200px of viewport
    );

    // Observe all image containers
    document.querySelectorAll('.lazy-image-container').forEach(img => {
      imgObserver.observe(img);
    });

    return () => {
      imgObserver.disconnect();
    };
  }, [processedListings]); // Re-run when listings change to observe new images


  // Function to toggle favorite status
  const toggleFavorite = (listingId) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(listingId)) {
        newFavorites.delete(listingId);
      } else {
        newFavorites.add(listingId);
      }
      return newFavorites;
    });
  };


  // --- Dynamic options for filters ---
  const locations = useMemo(() => ['all', ...new Set(allListings.map(p => p.location).filter(Boolean))], [allListings]);
  const breeds = useMemo(() => {
    if (petTypeFilter === 'all') return ['all'];
    return ['all', ...new Set(allListings.filter(p => p.category === 'pet' && p.type === petTypeFilter).map(p => p.breed).filter(Boolean))];
  }, [allListings, petTypeFilter]);
  const conditions = useMemo(() => ['all', 'new', 'like-new', 'good', 'fair', 'used'], []);


  // Handlers for filter changes
  const handlePriceRangeChange = (e, index) => {
    const value = parseInt(e.target.value, 10);
    const newRange = [...priceRange];
    newRange[index] = isNaN(value) ? (index === 0 ? 0 : 50000) : value;
    if (index === 0 && newRange[0] > newRange[1]) newRange[0] = newRange[1];
    if (index === 1 && newRange[1] < newRange[0]) newRange[1] = newRange[0];
    setPriceRange(newRange);
  };

  const toggleMobileFilter = () => setIsMobileFilterOpen(!isMobileFilterOpen);

  return (
    <>
      {/* 8. Modify the Header component reference to capture its height with ref */}
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
          {/* 7. Replace the existing aside element with this fixed sidebar implementation */}
          <aside className={`${isMobileFilterOpen ? 'fixed inset-0 z-40 overflow-y-auto bg-white p-6 w-full' : 'hidden'} md:block md:relative md:w-72 md:z-30`}>
            <div
              className={`md:sticky transition-all duration-200 overflow-y-auto`}
              style={{
                top: scrollPosition > (headerRef.current?.offsetHeight || 0) ? '1rem' : `${(headerRef.current?.offsetHeight || 0) + 16}px`,
                maxHeight: `calc(100vh - ${scrollPosition > (headerRef.current?.offsetHeight || 0) ? '2rem' : `${(headerRef.current?.offsetHeight || 0) + 32}px`})`
              }}
            >
              {/* Existing sidebar content */}
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
                  <div className="flex flex-wrap gap-2">
                    {['all', 'pet', 'supply'].map(cat => (
                      <label key={cat} className="cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={categoryFilter === cat}
                          onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setPetTypeFilter('all');
                            setBreedFilter('all');
                            setSupplyConditionFilter('all');
                          }}
                          className="peer hidden"
                        />
                        <div className="px-3 py-1 rounded-full text-sm border border-gray-300 text-gray-600 peer-checked:bg-orange-500 peer-checked:text-white hover:bg-orange-100 transition-all">
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </div>
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
                  <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded-md">
                    <input
                      type="checkbox"
                      checked={showFavoritesFilter}
                      onChange={(e) => setShowFavoritesFilter(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-orange-500 rounded border-gray-300 focus:ring-orange-400 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-600">Show Only My Favorites</span>
                  </label>
                )}
              </div>

              {/* Pet Filters */}
              {(categoryFilter === 'pet' || categoryFilter === 'all') && (
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700 cursor-pointer flex justify-between items-center" onClick={() => toggleSection('petFilters')}>
                    Pet Filters {expandedSections.petFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </h3>
                  {expandedSections.petFilters && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Pet Type</label>
                        <div className="flex flex-wrap gap-2">
                          {['all', 'dog', 'cat'].map(type => (
                            <label key={type} className="cursor-pointer">
                              <input
                                type="radio"
                                name="petType"
                                value={type}
                                checked={petTypeFilter === type}
                                onChange={(e) => { setPetTypeFilter(e.target.value); setBreedFilter('all'); }}
                                className="peer hidden"
                              />
                              <div className="px-3 py-1 rounded-full text-sm border border-gray-300 text-gray-600 peer-checked:bg-orange-500 peer-checked:text-white hover:bg-orange-100 transition-all">
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </div>
                            </label>
                          ))}
                        </div>
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

              {/* Supply Filters */}
              {(categoryFilter === 'supply' || categoryFilter === 'all') && (
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700 cursor-pointer flex justify-between items-center" onClick={() => toggleSection('supplyFilters')}>
                    Supply Filters {expandedSections.supplyFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </h3>
                  {expandedSections.supplyFilters && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Condition</label>
                      <div className="flex flex-wrap gap-2">
                        {conditions.map(cond => (
                          <label key={cond} className="cursor-pointer">
                            <input
                              type="radio"
                              name="supplyCondition"
                              value={cond}
                              checked={supplyConditionFilter === cond}
                              onChange={(e) => setSupplyConditionFilter(e.target.value)}
                              className="peer hidden"
                            />
                            <div className="px-3 py-1 rounded-full text-sm border border-gray-300 text-gray-600 peer-checked:bg-orange-500 peer-checked:text-white hover:bg-orange-100 transition-all">
                              {cond.charAt(0).toUpperCase() + cond.slice(1).replace('-', ' ')}
                            </div>
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
                        setCategoryFilter('all');
                        setPetTypeFilter('all');
                        setBreedFilter('all');
                        setSupplyConditionFilter('all');
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
                        {/* 9. Update the image rendering in the listings grid to support lazy loading */}
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
                                loading="lazy" /* Native lazy loading as a fallback */
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

