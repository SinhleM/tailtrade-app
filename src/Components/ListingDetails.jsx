// src/Components/ListingDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from './Header'; // Assuming Header and Footer are in the same directory
import Footer from './Footer';
import {
  User, MapPin, Tag, CalendarDays, Info, AlertTriangle,
  ShoppingBag, MessageSquare, ChevronLeft, ChevronRight,
  Flag, CheckCircle2, Send, XCircle, Check
} from 'lucide-react';
import { useAuth } from '../AuthContext'; // Adjusted path: Assumes AuthContext.jsx is in src/

const ListingDetail = () => {
    const { listingType, listingId } = useParams();
    const navigate = useNavigate();
    const { loggedInUserId, authLoading } = useAuth();
    const apiBaseUrl = 'http://localhost/PET-C2C-PROJECT/TailTrade/Backend';

    const [listing, setListing] = useState(null);
    const [uploader, setUploader] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

    // States for Report feature
    const [showReportInput, setShowReportInput] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isProcessingReport, setIsProcessingReport] = useState(false);

    // States for Mark as Sold feature
    const [showMarkSoldConfirm, setShowMarkSoldConfirm] = useState(false);
    const [isProcessingMarkSold, setIsProcessingMarkSold] = useState(false);

    useEffect(() => {
        if (authLoading) {
            setLoading(true);
            return;
        }
        setLoading(true);
        setError(null);
        setActionMessage({ text: '', type: '' });
        setShowReportInput(false);
        setReportReason('');
        setShowMarkSoldConfirm(false);

        fetch(`${apiBaseUrl}/Get_Listing_Details.php?type=${listingType}&id=${listingId}`) //
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
                    }).catch(() => {
                        throw new Error(`HTTP error! status: ${response.status}. Malformed response or server error.`);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.listing) {
                    setListing(data.listing);
                    setUploader(data.uploader);
                } else {
                    setError(data.message || 'Could not fetch listing details. The listing may not exist or data is incomplete.');
                    setListing(null);
                }
            })
            .catch(err => {
                console.error('Error fetching listing details:', err);
                setError(`Failed to connect or an error occurred: ${err.message}.`);
                setListing(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [listingType, listingId, authLoading, apiBaseUrl]);

    const handleContactSeller = () => {
        if (authLoading) {
            setActionMessage({text: "Still checking authentication status. Please wait a moment.", type: 'info'});
            return;
        }
        if (!loggedInUserId) {
            setActionMessage({text: "You need to be logged in to contact a seller. Please log in.", type: 'error'});
            navigate("/login", { state: { from: `/listing/${listingType}/${listingId}` } });
            return;
        }
        if (!uploader || typeof uploader.id === 'undefined') {
            setActionMessage({text: "Seller information is not available or seller ID is missing. Cannot initiate contact.", type: 'error'});
            return;
        }
        if (uploader.id === loggedInUserId) {
            setActionMessage({text: "You cannot message yourself.", type: 'info'});
            return;
        }
        navigate('/MessagingPage', {
            state: {
                recipientId: uploader.id,
                recipientName: uploader.name || `User ${uploader.id}`
            }
        });
    };

    const handleToggleReportInput = () => {
        const newShowState = !showReportInput;
        setShowReportInput(newShowState);
        if (!newShowState || showReportInput) {
            setReportReason('');
        }
        setShowMarkSoldConfirm(false);
        setActionMessage({ text: '', type: '' });
    };

    const handleSubmitReport = async () => {
        if (!reportReason.trim()) {
            setActionMessage({ text: 'A reason is required to report this listing.', type: 'error' });
            return;
        }
        if (!listing || !loggedInUserId) {
             setActionMessage({ text: 'Cannot submit report: missing data or not logged in.', type: 'error' });
            return;
        }

        setIsProcessingReport(true);
        setActionMessage({ text: 'Submitting report...', type: 'info' });
        try {
            const response = await fetch(`${apiBaseUrl}/Admin/Handle_Flagged_Content.php`, { // MODIFIED URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ // MODIFIED PAYLOAD
                    itemId: listing.id,
                    itemType: listing.listing_type,
                    reporterId: loggedInUserId,
                    reason: reportReason.trim(),
                    action: 'submit_report' // Action for backend to identify the task
                }),
            });
            const result = await response.json();
            if (result.success) {
                setActionMessage({ text: result.message || 'Listing reported successfully. Thank you.', type: 'success' });
                setShowReportInput(false);
                setReportReason('');
            } else {
                setActionMessage({ text: result.message || 'Failed to report listing.', type: 'error' });
            }
        } catch (err) {
            console.error('Error reporting listing:', err);
            setActionMessage({ text: `Error submitting report: ${err.message}`, type: 'error' });
        } finally {
            setIsProcessingReport(false);
        }
    };

    const handleShowMarkSoldConfirm = () => {
        setShowMarkSoldConfirm(true);
        setShowReportInput(false);
        setActionMessage({ text: '', type: '' });
    };

    const handleCancelMarkSold = () => {
        setShowMarkSoldConfirm(false);
    };

    const handleConfirmMarkAsSold = async () => {
        if (!listing || !loggedInUserId) {
            setActionMessage({ text: 'Cannot mark as sold: missing data or not logged in.', type: 'error' });
            return;
        }

        // Frontend check to ensure the user owns the listing
        if (uploader && uploader.id !== loggedInUserId) {
            setActionMessage({ text: 'You can only mark your own listings as sold.', type: 'error' });
            return;
        }

        setIsProcessingMarkSold(true);
        setActionMessage({ text: 'Updating status to sold...', type: 'info' });
        try {
            const response = await fetch(`${apiBaseUrl}/Admin/Update_Listing_Status.php`, { // MODIFIED URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ // MODIFIED PAYLOAD
                    listingId: listing.id,
                    listingType: listing.listing_type,
                    status: 'sold'
                }),
            });
            const result = await response.json();
            if (result.success) {
                setActionMessage({ text: result.message || 'Listing marked as sold successfully!', type: 'success' });
                setListing(prevListing => ({ ...prevListing, status: 'sold' }));
                setShowMarkSoldConfirm(false);
            } else {
                setActionMessage({ text: result.message || 'Failed to mark listing as sold.', type: 'error' });
            }
        } catch (err) {
            console.error('Error marking listing as sold:', err);
            setActionMessage({ text: `Error updating status: ${err.message}`, type: 'error' });
        } finally {
            setIsProcessingMarkSold(false);
        }
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
        e.target.onerror = null;
        e.target.src = `https://placehold.co/800x600/FECACA/B91C1C?text=Image+Not+Available&font=Lato`;
    };
    const scrollToSection = (sectionId) => (event) => {
        event.preventDefault();
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

    const isOwner = uploader && loggedInUserId && uploader.id === loggedInUserId;
    const isSold = listing && listing.status === 'sold';

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-inter">
            <Header scrollToSection={scrollToSection} />
            <main className="flex-grow">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 my-8">
                    {actionMessage.text && (
                        <div className={`mb-6 p-4 rounded-md text-center text-sm ${actionMessage.type === 'success' ? 'bg-green-100 text-green-700' : actionMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {actionMessage.text}
                        </div>
                    )}

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
                                    <button onClick={goToPrevImage} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white" aria-label="Previous image"><ChevronLeft size={24} /></button>
                                    <button onClick={goToNextImage} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white" aria-label="Next image"><ChevronRight size={24} /></button>
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">{currentImageIndex + 1} / {listing.images.length}</div>
                                </>
                            )}
                        </div>

                        <div className="lg:col-span-2 p-6 md:p-10 flex flex-col">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 break-words">{listing.name}</h1>
                             {isSold && ( <span className="inline-block bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full mb-2 uppercase tracking-wider">Sold</span> )}
                            <div className="text-3xl font-semibold mb-6" style={{ color: 'var(--color-primary)' }}>R {parseFloat(listing.price).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>

                            <div className="space-y-3 text-gray-700 mb-6 text-base">
                                <div className="flex items-start"><MapPin size={20} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /><div><span className="font-medium">Location:</span> {listing.location}</div></div>
                                {isPet && (<>
                                    <div className="flex items-start"><Tag size={20} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /><div><span className="font-medium">Type:</span> {listing.type}</div></div>
                                    {listing.breed && <div className="flex items-start"><Tag size={20} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /><div><span className="font-medium">Breed:</span> {listing.breed}</div></div> }
                                    {listing.age !== null && typeof listing.age !== 'undefined' && <div className="flex items-start"><CalendarDays size={20} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /><div><span className="font-medium">Age:</span> {listing.age} year(s)</div></div> }
                                </>)}
                                {!isPet && listing.condition && ( <div className="flex items-start"><Tag size={20} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /><div><span className="font-medium">Condition:</span> {listing.condition.replace('-', ' ')}</div></div> )}
                                <div className="flex items-start"><Info size={20} className="mr-3 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }} /><div><span className="font-medium">Listed:</span> {new Date(listing.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Description</h3>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{listing.description || "No description provided."}</p>
                            </div>

                            {uploader && (
                                <div className="border-t border-gray-200 pt-6 mt-auto">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Seller Information</h3>
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm mb-4">
                                        <div className="p-2 rounded-full mr-3" style={{ backgroundColor: 'var(--color-primary)'}}><User size={24} className="text-white" /></div>
                                        <div><p className="text-md font-semibold text-gray-800">{uploader.name}</p>{uploader.email && <a href={`mailto:${uploader.email}`} className="text-xs hover:underline" style={{ color: 'var(--color-primary)'}}>{uploader.email}</a>}</div>
                                    </div>

                                    <div className="space-y-3">
                                        {!isSold && !isOwner && loggedInUserId && (
                                            <button
                                                className="w-full px-4 py-2.5 rounded-md text-white font-semibold shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all flex items-center justify-center text-sm"
                                                style={{ backgroundColor: 'var(--color-primary)' }}
                                                onClick={handleContactSeller}
                                                disabled={authLoading}
                                            >
                                                <MessageSquare size={18} className="mr-2" /> Contact Seller
                                            </button>
                                        )}

                                        {isOwner && !isSold && (
                                            <div className="border border-gray-200 rounded-md">
                                                {!showMarkSoldConfirm ? (
                                                    <button
                                                        className="w-full px-4 py-2.5 rounded-md text-white font-semibold shadow-sm hover:opacity-90 focus:outline-none transition-all flex items-center justify-center text-sm"
                                                        style={{ backgroundColor: '#22c55e' }}
                                                        onClick={handleShowMarkSoldConfirm}
                                                        disabled={authLoading || isProcessingMarkSold}
                                                    >
                                                        <CheckCircle2 size={18} className="mr-2" /> Mark as Sold
                                                    </button>
                                                ) : (
                                                    <div className="p-3 bg-gray-50 rounded-md">
                                                        <p className="text-xs text-gray-700 mb-2 text-center">Are you sure you want to mark this item as sold?</p>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={handleConfirmMarkAsSold}
                                                                className="flex-1 px-3 py-1.5 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center justify-center"
                                                                disabled={isProcessingMarkSold}
                                                            >
                                                                <Check size={16} className="mr-1"/> {isProcessingMarkSold ? 'Confirming...' : 'Confirm'}
                                                            </button>
                                                            <button
                                                                onClick={handleCancelMarkSold}
                                                                className="flex-1 px-3 py-1.5 bg-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-400 disabled:opacity-50 flex items-center justify-center"
                                                                disabled={isProcessingMarkSold}
                                                            >
                                                                <XCircle size={16} className="mr-1"/> Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {!isOwner && loggedInUserId && !isSold && (
                                             <div className="border border-gray-200 rounded-md">
                                                {!showReportInput ? (
                                                    <button
                                                        className="w-full px-4 py-2.5 rounded-md text-red-600 border border-red-500 hover:bg-red-50 font-semibold shadow-sm focus:outline-none transition-all flex items-center justify-center text-sm"
                                                        onClick={handleToggleReportInput}
                                                        disabled={authLoading || isProcessingReport}
                                                    >
                                                        <Flag size={18} className="mr-2" /> Report Listing
                                                    </button>
                                                ) : (
                                                    <div className="p-3 bg-gray-50 rounded-md">
                                                        <p className="text-xs text-gray-700 mb-1">Please provide a reason for reporting:</p>
                                                        <textarea
                                                            value={reportReason}
                                                            onChange={(e) => setReportReason(e.target.value)}
                                                            placeholder="Enter reason here..."
                                                            className="w-full p-2 border border-gray-300 rounded-md mb-2 text-xs focus:ring-orange-500 focus:border-orange-500"
                                                            rows="3"
                                                        ></textarea>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={handleSubmitReport}
                                                                className="flex-1 px-3 py-1.5 bg-orange-500 text-white text-xs rounded-md hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center"
                                                                disabled={isProcessingReport || !reportReason.trim()}
                                                            >
                                                                <Send size={16} className="mr-1"/> {isProcessingReport ? 'Submitting...' : 'Submit Report'}
                                                            </button>
                                                            <button
                                                                onClick={handleToggleReportInput}
                                                                className="flex-1 px-3 py-1.5 bg-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-400 disabled:opacity-50 flex items-center justify-center"
                                                                disabled={isProcessingReport}
                                                            >
                                                                 <XCircle size={16} className="mr-1"/> Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                     {isOwner && (
                                        <p className="text-center text-xs text-gray-500 mt-3">
                                            {isSold ? "You have marked this item as sold." : "This is your listing."}
                                        </p>
                                     )}
                                </div>
                            )}
                             <div className="mt-6 text-center">
                                <Link to="/Menu" className="text-sm font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
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