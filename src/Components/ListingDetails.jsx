// src/Components/ListingDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './Header'; // Assuming Header.jsx is in the same directory or correct path
import Footer from './Footer'; // Assuming Footer.jsx is in the same directory or correct path
import { User, MapPin, Tag, CalendarDays, Info, AlertTriangle, ShoppingBag, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

const ListingDetail = () => {
    const { listingType, listingId } = useParams();
    const [listing, setListing] = useState(null);
    const [uploader, setUploader] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Simple scroll function for this page, if needed by Header/Footer
    const scrollToSection = (sectionId) => (event) => {
        event.preventDefault();
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    useEffect(() => {
        setLoading(true);
        setError(null);
        
        fetch(`http://localhost/PET-C2C-PROJECT/TailTrade/Backend/Get_Listing_Details.php?type=${listingType}&id=${listingId}`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
                    }).catch(() => {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.listing) {
                    console.log("Listing data received:", data.listing);
                    setListing(data.listing);
                    setUploader(data.uploader);
                } else {
                    setError(data.message || 'Could not fetch listing details. The listing may not exist.');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching listing details:', err);
                setError(`Failed to connect or an error occurred: ${err.message}. Please ensure the backend is running and accessible.`);
                setLoading(false);
            });
    }, [listingType, listingId]);

    const goToNextImage = () => {
        if (listing && listing.images && listing.images.length > 0) {
            setCurrentImageIndex((prevIndex) => 
                prevIndex === listing.images.length - 1 ? 0 : prevIndex + 1
            );
        }
    };

    const goToPrevImage = () => {
        if (listing && listing.images && listing.images.length > 0) {
            setCurrentImageIndex((prevIndex) => 
                prevIndex === 0 ? listing.images.length - 1 : prevIndex - 1
            );
        }
    };

    const imageLoadError = (e) => {
        console.error("Failed to load image:", e.target.src); // Added for easier debugging
        e.target.onerror = null; 
        e.target.src = `https://placehold.co/800x600/FECACA/B91C1C?text=Image+Not+Available&font=Lato`;
    };

    if (loading) {
        return (
            <>
                <Header scrollToSection={scrollToSection} />
                <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4" style={{ borderColor: 'var(--color-primary)' }}></div>
                    <p className="ml-4 text-xl text-gray-700 mt-4">Loading listing details...</p>
                </div>
                <Footer scrollToSection={scrollToSection} />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header scrollToSection={scrollToSection} />
                <div className="container mx-auto px-4 py-12 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
                    <AlertTriangle size={56} className="mx-auto mb-5" style={{ color: 'var(--color-rose-600)'}} />
                    <h2 className="text-3xl font-semibold mb-3" style={{ color: 'var(--color-rose-700)'}}>Error Fetching Listing</h2>
                    <p className="text-gray-600 text-lg mb-6">{error}</p>
                    <Link to="/Menu" className="px-8 py-3 rounded-md text-white font-semibold shadow-md hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--color-primary)' }}>
                        Back to Listings
                    </Link>
                </div>
                <Footer scrollToSection={scrollToSection} />
            </>
        );
    }
    
    if (!listing) {
         return (
            <>
                <Header scrollToSection={scrollToSection} />
                <div className="container mx-auto px-4 py-12 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
                    <ShoppingBag size={56} className="mx-auto text-gray-400 mb-5" />
                    <h2 className="text-3xl font-semibold text-gray-700 mb-3">Listing Not Found</h2>
                    <p className="text-gray-500 text-lg mb-6">The listing you are looking for does not exist or could not be loaded.</p>
                    <Link to="/Menu" className="px-8 py-3 rounded-md text-white font-semibold shadow-md hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--color-primary)' }}>
                        Back to Listings
                    </Link>
                </div>
                <Footer scrollToSection={scrollToSection} />
            </>
        );
    }

    const isPet = listing.listing_type === 'pet';
    const placeholderImage = `https://placehold.co/800x600/E2E8F0/718096?text=${encodeURIComponent(listing.name.split(' ').slice(0,2).join(' '))}&font=Lato`;
    
    const currentImage = listing.images && listing.images.length > 0 
        ? listing.images[currentImageIndex] 
        : placeholderImage;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header scrollToSection={scrollToSection} />
            <main className="flex-grow">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 my-8">
                    <div className="bg-white shadow-2xl rounded-xl overflow-hidden lg:grid lg:grid-cols-5 gap-0">
                        {/* Image Section */}
                        <div className="lg:col-span-3 relative">
                            <img
                                src={currentImage}
                                alt={listing.name}
                                className="w-full h-72 sm:h-96 lg:h-full object-cover"
                                onError={imageLoadError}
                            />
                            
                            {listing.images && listing.images.length > 1 && (
                                <>
                                    <button 
                                        onClick={goToPrevImage}
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button 
                                        onClick={goToNextImage}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                    
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                        {currentImageIndex + 1} / {listing.images.length}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="lg:col-span-2 p-6 md:p-10 flex flex-col">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 break-words">{listing.name}</h1>
                            <div className="text-3xl font-semibold mb-6" style={{ color: 'var(--color-primary)' }}> {/* Changed from p to div to allow complex content for price, or keep as p if it's just text */}
                                R {parseFloat(listing.price).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>

                            {/* THIS IS THE CORRECTED SECTION FOR HYDRATION ERROR */}
                            <div className="space-y-3 text-gray-700 mb-6 text-lg">
                                <div className="flex items-start"> {/* Changed from p to div */}
                                    <MapPin size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /> 
                                    <div><span className="font-medium">Location:</span> {listing.location}</div>
                                </div>
                                {isPet && (
                                    <>
                                        <div className="flex items-start"> {/* Changed from p to div */}
                                            <Tag size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /> 
                                            <div><span className="font-medium">Type:</span> {listing.type}</div>
                                        </div>
                                        {listing.breed && 
                                            <div className="flex items-start"> {/* Changed from p to div */}
                                                <Tag size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /> 
                                                <div><span className="font-medium">Breed:</span> {listing.breed}</div>
                                            </div>
                                        }
                                        {listing.age !== null && typeof listing.age !== 'undefined' && 
                                            <div className="flex items-start"> {/* Changed from p to div */}
                                                <CalendarDays size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /> 
                                                <div><span className="font-medium">Age:</span> {listing.age} year(s)</div>
                                            </div>
                                        }
                                    </>
                                )}
                                {!isPet && listing.condition && (
                                     <div className="flex items-start"> {/* Changed from p to div */}
                                         <Tag size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /> 
                                         <div><span className="font-medium">Condition:</span> {listing.condition.replace('-', ' ')}</div>
                                     </div>
                                )}
                                 <div className="flex items-start"> {/* Changed from p to div */}
                                    <Info size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /> 
                                    <div><span className="font-medium">Listed:</span> {new Date(listing.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                 </div>
                            </div>
                            {/* END OF CORRECTED SECTION */}

                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Description</h3>
                                <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">{listing.description || "No description provided."}</p>
                            </div>

                            {uploader && (
                                <div className="border-t border-gray-200 pt-6 mt-auto">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Seller Information</h3>
                                    <div className="flex items-center p-4 bg-gray-100 rounded-lg shadow-sm">
                                        <div className="p-2 rounded-full mr-4" style={{ backgroundColor: 'var(--color-primary)'}}>
                                            <User size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">{uploader.name}</p>
                                            <a href={`mailto:${uploader.email}`} className="text-sm hover:underline" style={{ color: 'var(--color-primary)'}}>{uploader.email}</a>
                                        </div>
                                    </div>
                                    <button 
                                        className="w-full mt-4 px-6 py-3 rounded-md text-white font-semibold shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                        onClick={() => alert('Contact functionality to be implemented.')}
                                    >
                                        <MessageSquare size={20} className="inline mr-2" /> Contact Seller
                                    </button>
                                </div>
                            )}
                             <div className="mt-8 text-center">
                                <Link to="/Menu" className="font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
                                    &larr; Back to all listings
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer scrollToSection={scrollToSection} />
        </div>
    );
};

export default ListingDetail;