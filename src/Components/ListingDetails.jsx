
// src/Components/ListingDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { User, MapPin, Tag, CalendarDays, Info, AlertTriangle, ShoppingBag, MessageSquare } from 'lucide-react'; // Added more icons

const ListingDetail = () => {
    const { listingType, listingId } = useParams(); // Get params from URL
    const [listing, setListing] = useState(null);
    const [uploader, setUploader] = useState(null); // To store uploader info
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        
        fetch(`http://localhost/PET-C2C-PROJECT/TailTrade/Backend/get_listing_detail.php?type=${listingType}&id=${listingId}`)
            .then(response => {
                if (!response.ok) {
                    // Try to get error message from response body if available
                    return response.json().then(errData => {
                        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
                    }).catch(() => {
                        // Fallback if response is not JSON or no message
                        throw new Error(`HTTP error! status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.listing) {
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
    const placeholderImage = `https://placehold.co/800x600/E2E8F0/718096?text=${encodeURIComponent(listing.name.split(' ').slice(0,2).join(' '))}&font= Lato`;
    const imageLoadError = (e) => {
        e.target.onerror = null; 
        e.target.src = `https://placehold.co/800x600/FECACA/B91C1C?text=Image+Not+Available&font=Lato`;
    };


    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header scrollToSection={scrollToSection} />
            <main className="flex-grow">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 my-8">
                    <div className="bg-white shadow-2xl rounded-xl overflow-hidden lg:grid lg:grid-cols-5 gap-0">
                        {/* Image Section */}
                        <div className="lg:col-span-3">
                            <img
                                src={listing.image_url || placeholderImage}
                                alt={listing.name}
                                className="w-full h-72 sm:h-96 lg:h-full object-cover"
                                onError={imageLoadError}
                            />
                        </div>

                        {/* Details Section */}
                        <div className="lg:col-span-2 p-6 md:p-10 flex flex-col">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 break-words">{listing.name}</h1>
                            <p className="text-3xl font-semibold mb-6" style={{ color: 'var(--color-primary)' }}>
                                R {parseFloat(listing.price).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>

                            <div className="space-y-3 text-gray-700 mb-6 text-lg">
                                <p className="flex items-start"><MapPin size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /> <div><span className="font-medium">Location:</span> {listing.location}</div></p>
                                {isPet && (
                                    <>
                                        <p className="flex items-start"><Tag size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /> <div><span className="font-medium">Type:</span> {listing.type}</div></p>
                                        {listing.breed && <p className="flex items-start"><Tag size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /> <div><span className="font-medium">Breed:</span> {listing.breed}</div></p>}
                                        {listing.age !== null && typeof listing.age !== 'undefined' && <p className="flex items-start"><CalendarDays size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /> <div><span className="font-medium">Age:</span> {listing.age} year(s)</div></p>}
                                    </>
                                )}
                                {!isPet && listing.condition && (
                                     <p className="flex items-start"><Tag size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /> <div><span className="font-medium">Condition:</span> {listing.condition.replace('-', ' ')}</div></p>
                                )}
                                 <p className="flex items-start"><Info size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /> <div><span className="font-medium">Listed:</span> {new Date(listing.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</div></p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Description</h3>
                                <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">{listing.description || "No description provided."}</p>
                            </div>

                            {uploader && (
                                <div className="border-t border-gray-200 pt-6 mt-auto"> {/* mt-auto pushes seller info to bottom if content is short */}
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Seller Information</h3>
                                    <div className="flex items-center p-4 bg-gray-100 rounded-lg shadow-sm">
                                        <div className="p-2 rounded-full mr-4" style={{ backgroundColor: 'var(--color-primary)'}}>
                                            <User size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">{uploader.name}</p>
                                            <a href={`mailto:${uploader.email}`} className="text-sm text-gray-600 hover:underline" style={{ color: 'var(--color-primary)'}}>{uploader.email}</a>
                                        </div>
                                    </div>
                                    {/* Example Contact Seller Button - functionality not implemented here */}
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