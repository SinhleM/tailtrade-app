// src/Components/MessagingPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import { useAuth } from '../AuthContext';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'; // Import an icon for the exit button
import config from '../config'; // <--- IMPORT THE CONFIG FILE
import axios from 'axios'; // <--- IMPORT AXIOS FOR API CALLS

const MessagingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, authLoading } = useAuth(); // Use 'user' from AuthContext

    const recipientIdFromState = location.state?.recipientId;
    const recipientNameFromState = location.state?.recipientName || 'User';

    const [currentUserId, setCurrentUserId] = useState(null);
    const [otherUserId, setOtherUserId] = useState(null);
    const [otherUserName, setOtherUserName] = useState('User');

    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!authLoading) {
            if (user && user.id) { // Check for user object and its ID
                setCurrentUserId(user.id);

                if (recipientIdFromState) {
                    if (user.id === recipientIdFromState) { // Compare with user.id
                        console.warn("MessagingPage: User attempting to message themselves.");
                        setError("You cannot message yourself.");
                        setOtherUserId(null);
                    } else {
                        setOtherUserId(recipientIdFromState);
                        setOtherUserName(recipientNameFromState || `User ${recipientIdFromState}`);
                        setError(null);
                    }
                } else {
                    console.warn("MessagingPage: No recipientId found in location state.");
                    setError("No recipient selected. Please select a conversation or start a new one.");
                    setOtherUserId(null);
                }
            } else {
                console.warn("MessagingPage: No logged-in user. Redirecting to login.");
                navigate("/login", { state: { from: location } });
            }
        }
    }, [authLoading, user, recipientIdFromState, recipientNameFromState, navigate, location]);


    const fetchMessages = useCallback(async () => {
        if (!currentUserId || !otherUserId || error === "You cannot message yourself.") {
            if (currentUserId && !otherUserId && !error?.includes("No recipient selected") && error !== "You cannot message yourself.") {
                 setError("Recipient not identified for fetching messages.");
            }
            return;
        }
        setLoadingMessages(true);
        try {
            // --- CRITICAL CHANGE HERE: Use config.js for the endpoint URL ---
            const url = `${config.API_BASE_URL}/${config.endpoints.GET_MESSAGES}?user1_id=${currentUserId}&user2_id=${otherUserId}`;
            const response = await axios.get(url, { timeout: 10000 }); // Use axios.get

            const data = response.data; // Axios automatically parses JSON
            if (data.success) {
                setMessages(data.messages);
                setError(null);
            } else {
                setError(data.message || 'Failed to parse messages from API.');
            }
        } catch (err) {
            let errorMessage = 'An unknown error occurred while fetching messages. Please check your connection.';
            if (axios.isAxiosError(err)) {
                if (err.code === 'ECONNABORTED') {
                    errorMessage = 'Request timed out while fetching messages.';
                } else if (err.response) {
                    errorMessage = err.response.data.message || `Server error: ${err.response.status}`;
                } else if (err.request) {
                    errorMessage = 'Network error or server did not respond.';
                }
            }
            console.error("Error fetching messages (catch block in fetchMessages):", err);
            setError(errorMessage);
        } finally {
            setLoadingMessages(false);
        }
    }, [currentUserId, otherUserId, error]);

    useEffect(() => {
        if (currentUserId && otherUserId && error !== "You cannot message yourself.") {
            fetchMessages();
            const intervalId = setInterval(fetchMessages, 10000);
            return () => clearInterval(intervalId);
        }
    }, [fetchMessages, currentUserId, otherUserId, error]);

    const handleSendMessage = async (messageContent) => {
        if (!currentUserId || !otherUserId || error === "You cannot message yourself.") {
            setError("Cannot send message: User details are not correctly set up or you are trying to message yourself.");
            return;
        }
        try {
            // --- CRITICAL CHANGE HERE: Use config.js for the endpoint URL ---
            const url = `${config.API_BASE_URL}/${config.endpoints.SEND_MESSAGE}`;
            const response = await axios.post(url, { // Use axios.post
                sender_id: currentUserId,
                receiver_id: otherUserId,
                message_content: messageContent,
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000 // Add timeout
            });

            const data = response.data; // Axios automatically parses JSON
            if (data.success) {
                // Optimistically add message to UI (optional, but good for UX)
                setMessages(prevMessages => [...prevMessages, {
                    id: data.message_id || `temp-${Date.now()}`, // Use actual ID if returned
                    sender_id: currentUserId,
                    message_content: messageContent,
                    created_at: new Date().toISOString() // Use server's timestamp if available
                }]);
                fetchMessages(); // Re-fetch to get the official message and timestamp
                setError(null);
            } else {
                setError(data.message || 'Failed to send message.');
            }
        } catch (err) {
            let errorMessage = 'An error occurred while sending message.';
            if (axios.isAxiosError(err)) {
                if (err.code === 'ECONNABORTED') {
                    errorMessage = 'Request timed out while sending message.';
                } else if (err.response) {
                    errorMessage = err.response.data.message || `Server error: ${err.response.status}`;
                } else if (err.request) {
                    errorMessage = 'Network error or server did not respond.';
                }
            }
            console.error("Error sending message:", err);
            setError(errorMessage);
        }
    };

    const LoadingSpinner = () => (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
    );

    const handleExitChat = () => {
        navigate('/Menu'); // Navigate to homepage or your main listings page
    };

    if (authLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="text-lg text-gray-600 mt-4">Loading authentication...</p>
                </div>
            </div>
        );
    }

    if (!currentUserId && !authLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                    <h2 className="text-2xl font-semibold text-red-600 mb-4">Authentication Required</h2>
                    <p className="text-gray-700 mb-6">Please log in to access your messages.</p>
                    <button
                        onClick={() => navigate('/login', { state: { from: location } })}
                        className="w-full px-6 py-3 rounded-md text-white font-semibold shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                        style={{ backgroundColor: 'var(--color-primary, #F97316)' }}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }
    
    if ((!otherUserId && error !== "You cannot message yourself.") || (error && error !== "You cannot message yourself." && messages.length === 0 && !loadingMessages && error !== "Recipient not identified for fetching messages." && !error?.includes("Failed to fetch messages")) ) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={handleExitChat}
                            title="Exit Chat"
                            className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
                        >
                            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <h2 className="text-2xl font-semibold text-red-600 mb-4">Messaging Unavailable</h2>
                    <p className="text-gray-700 mb-2">
                        {error || "Please select a user to message from a listing page."}
                    </p>
                    {error && <p className="text-sm text-gray-500 mb-6">If the problem persists, please try again later or contact support.</p>}
                    <button
                        onClick={() => navigate('/Menu')}
                        className="w-full mt-4 px-6 py-3 rounded-md text-white font-semibold shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                        style={{ backgroundColor: 'var(--color-primary, #F97316)' }}
                    >
                        Browse Listings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col h-screen bg-gray-100 font-inter antialiased">
                <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 flex-grow flex flex-col max-h-[calc(100vh-theme(spacing.16))]">
                    <div className="bg-white shadow-xl rounded-lg flex flex-col flex-grow max-w-3xl mx-auto w-full overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-slate-50 sticky top-0 z-10 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-800">
                                Chat with {otherUserName}
                            </h2>
                            <button
                                onClick={handleExitChat}
                                title="Exit Chat"
                                className="p-2 rounded-full hover:bg-gray-200 text-gray-600 hover:text-orange-600 transition-colors duration-150 ease-in-out"
                            >
                                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {loadingMessages && messages.length === 0 && (
                            <div className="flex-grow flex items-center justify-center">
                                <LoadingSpinner />
                            </div>
                        )}

                        {error && error !== "You cannot message yourself." && error !== "Recipient not identified for fetching messages." && !loadingMessages && messages.length === 0 && (
                             <div className="p-4 m-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-center">
                                 <p><strong>Error:</strong> {error}</p>
                                 <p className="text-sm text-gray-600 mt-1">Please try refreshing or check your connection.</p>
                             </div>
                        )}
                        
                        {error === "You cannot message yourself." && (
                            <div className="flex-grow flex items-center justify-center p-10 text-center text-gray-600">
                                You cannot send messages to yourself. Select another user to chat.
                            </div>
                        )}

                        {currentUserId && otherUserId && error !== "You cannot message yourself." && (
                            <>
                                <MessageList messages={messages} currentUserId={currentUserId} />
                                <MessageForm onSendMessage={handleSendMessage} />
                            </>
                        )}
                        {error === "Recipient not identified for fetching messages." && messages.length === 0 && !loadingMessages &&(
                             <div className="flex-grow flex items-center justify-center p-10 text-center text-gray-500">
                                 Select a conversation to view messages.
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MessagingPage;