// src/Components/ListingDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from './Header'; // Assuming Header and Footer are in the same directory
import Footer from './Footer';
import { User, MapPin, Tag, CalendarDays, Info, AlertTriangle, ShoppingBag, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../AuthContext'; // Adjusted path: Assumes AuthContext.jsx is in src/

const ListingDetail = () => {
    const { listingType, listingId } = useParams();
    const navigate = useNavigate();
    const { loggedInUserId, authLoading } = useAuth();

    const [listing, setListing] = useState(null);
    const [uploader, setUploader] = useState(null); // This will now contain uploader.id from backend
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (authLoading) { // Don't fetch if auth status is still being determined
            setLoading(true);
            return;
        }
        setLoading(true);
        setError(null);

        fetch(`http://localhost/PET-C2C-PROJECT/TailTrade/Backend/Get_Listing_Details.php?type=${listingType}&id=${listingId}`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
                    }).catch(() => {
                        throw new Error(`HTTP error! status: ${response.status}. Server might be down or CORS issue.`);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.listing) {
                    setListing(data.listing);
                    setUploader(data.uploader); // data.uploader should now include 'id'
                    
                    // You can verify here if uploader.id is present
                    if (data.uploader && typeof data.uploader.id === 'undefined') {
                        console.warn("ListingDetail: Uploader ID is still missing from backend response. Uploader data:", data.uploader);
                        // This might indicate an issue if the backend change wasn't effective or data is malformed.
                    }

                } else {
                    setError(data.message || 'Could not fetch listing details. The listing may not exist.');
                }
            })
            .catch(err => {
                console.error('Error fetching listing details:', err);
                setError(`Failed to connect or an error occurred: ${err.message}.`);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [listingType, listingId, authLoading]); // authLoading dependency is important

    const handleContactSeller = () => {
        if (authLoading) {
            alert("Still checking authentication status. Please wait a moment.");
            return;
        }

        if (!loggedInUserId) {
            alert("You need to be logged in to contact a seller. Please log in.");
            navigate("/login", { state: { from: `/listing/${listingType}/${listingId}` } }); // Pass current location to redirect back
            return;
        }

        // This check should now work correctly if Get_Listing_Details.php sends uploader.id
        if (!uploader || typeof uploader.id === 'undefined') {
            alert("Seller information is not available or seller ID is missing. Cannot initiate contact.");
            console.error("handleContactSeller: Uploader data or uploader.id is missing. Uploader:", uploader);
            return;
        }

        if (uploader.id === loggedInUserId) {
            alert("You cannot message yourself.");
            return;
        }
        
        console.log("Navigating to MessagingPage with recipientId:", uploader.id, "recipientName:", uploader.name);
        navigate('/MessagingPage', { // Ensure this route '/MessagingPage' matches your App.jsx setup
            state: {
                recipientId: uploader.id,
                recipientName: uploader.name || `User ${uploader.id}`
            }
        });
    };

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
        e.target.onerror = null; // Prevent infinite loop if placeholder also fails
        e.target.src = `https://placehold.co/800x600/FECACA/B91C1C?text=Image+Not+Available&font=Lato`;
    };
    const scrollToSection = (sectionId) => (event) => {
        event.preventDefault();
        // Implement scroll logic if Header/Footer need it, otherwise, it's a dummy for prop passing
    };


    if (loading || authLoading) {
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
    const placeholderImage = `https://placehold.co/800x600/E2E8F0/718096?text=${encodeURIComponent(listing.name?.split(' ').slice(0,2).join(' ') || 'Listing')}&font=Lato`;
    const currentImage = listing.images && listing.images.length > 0
        ? listing.images[currentImageIndex]
        : placeholderImage;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-inter">
            <Header scrollToSection={scrollToSection} />
            <main className="flex-grow">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 my-8">
                    <div className="bg-white shadow-2xl rounded-xl overflow-hidden lg:grid lg:grid-cols-5 gap-0">
                        <div className="lg:col-span-3 relative">
                            <img
                                src={currentImage}
                                alt={listing.name || "Listing image"}
                                className="w-full h-72 sm:h-96 lg:h-full object-cover"
                                onError={imageLoadError}
                            />
                             {listing.images && listing.images.length > 1 && (
                                <>
                                    <button
                                        onClick={goToPrevImage}
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={goToNextImage}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white"
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
                        <div className="lg:col-span-2 p-6 md:p-10 flex flex-col">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 break-words">{listing.name}</h1>
                            <div className="text-3xl font-semibold mb-6" style={{ color: 'var(--color-primary)' }}>
                                R {parseFloat(listing.price).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="space-y-3 text-gray-700 mb-6 text-lg">
                                <div className="flex items-start">
                                    <MapPin size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                                    <div><span className="font-medium">Location:</span> {listing.location}</div>
                                </div>
                                {isPet && (
                                    <>
                                        <div className="flex items-start">
                                            <Tag size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                                            <div><span className="font-medium">Type:</span> {listing.type}</div>
                                        </div>
                                        {listing.breed &&
                                            <div className="flex items-start">
                                                <Tag size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                                                <div><span className="font-medium">Breed:</span> {listing.breed}</div>
                                            </div>
                                        }
                                        {listing.age !== null && typeof listing.age !== 'undefined' &&
                                            <div className="flex items-start">
                                                <CalendarDays size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                                                <div><span className="font-medium">Age:</span> {listing.age} year(s)</div>
                                            </div>
                                        }
                                    </>
                                )}
                                {!isPet && listing.condition && (
                                     <div className="flex items-start">
                                         <Tag size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                                         <div><span className="font-medium">Condition:</span> {listing.condition.replace('-', ' ')}</div>
                                     </div>
                                )}
                                 <div className="flex items-start">
                                    <Info size={22} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                                    <div><span className="font-medium">Listed:</span> {new Date(listing.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                 </div>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Description</h3>
                                <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">{listing.description || "No description provided."}</p>
                            </div>

                            {uploader && ( // This block will render if uploader details (including id) are present
                                <div className="border-t border-gray-200 pt-6 mt-auto">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Seller Information</h3>
                                    <div className="flex items-center p-4 bg-gray-100 rounded-lg shadow-sm">
                                        <div className="p-2 rounded-full mr-4" style={{ backgroundColor: 'var(--color-primary)'}}>
                                            <User size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">{uploader.name}</p>
                                            {uploader.email && 
                                                <a href={`mailto:${uploader.email}`} className="text-sm hover:underline" style={{ color: 'var(--color-primary)'}}>{uploader.email}</a>
                                            }
                                        </div>
                                    </div>
                                    <button
                                        className="w-full mt-4 px-6 py-3 rounded-md text-white font-semibold shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all disabled:opacity-70"
                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                        onClick={handleContactSeller}
                                        disabled={authLoading || !uploader || typeof uploader.id === 'undefined' || uploader.id === loggedInUserId} 
                                    >
                                        <MessageSquare size={20} className="inline mr-2" /> 
                                        {uploader.id === loggedInUserId ? "This is your listing" : "Contact Seller"}
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
