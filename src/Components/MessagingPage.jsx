// src/Components/MessagingPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MessageList from './MessageList'; 
import MessageForm from './MessageForm';
import { useAuth } from '../AuthContext'; 
// import Header from './Header'; 
// import Footer from './Footer';

const MessagingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { loggedInUserId, authLoading } = useAuth();

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
            if (loggedInUserId) {
                setCurrentUserId(loggedInUserId);

                if (recipientIdFromState) {
                    if (loggedInUserId === recipientIdFromState) {
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
                    setError("No recipient selected for messaging. Please go back to a listing to start a chat.");
                    setOtherUserId(null);
                }
            } else {
                console.warn("MessagingPage: No logged-in user. Redirecting to login.");
                navigate("/login", { state: { from: location } }); 
            }
        }
    }, [authLoading, loggedInUserId, recipientIdFromState, recipientNameFromState, navigate, location]);


    const fetchMessages = useCallback(async () => {
        if (!currentUserId || !otherUserId || error === "You cannot message yourself.") {
            if (currentUserId && !otherUserId && !error?.includes("No recipient selected") && error !== "You cannot message yourself.") {
                 setError("Recipient not identified for fetching messages.");
            }
            return;
        }
        setLoadingMessages(true);
        setError(null); // Clear previous errors before a new fetch attempt
        try {
            // *** POTENTIAL FIX: Adjusted URL to include /PET-C2C-PROJECT/ ***
            // *** Verify this is the correct base path for your backend scripts ***
            const response = await fetch(`http://localhost/PET-C2C-PROJECT/TailTrade/Backend/get_messages.php?user1_id=${currentUserId}&user2_id=${otherUserId}`);
            
            if (!response.ok) {
                // If response is not OK, it could be 404, 500, etc.
                // The CORS error might still appear if it's a 404 because no headers are sent.
                const errorText = await response.text(); // Get raw text to see what the server returned
                console.error("Server error response (not OK):", response.status, errorText);
                throw new Error(`Failed to fetch messages. Status: ${response.status}. Message: ${errorText || 'No additional error message.'}`);
            }
            
            const data = await response.json();
            if (data.success) {
                setMessages(data.messages);
                setError(null); 
            } else {
                setError(data.message || 'Failed to fetch messages from API (API returned success:false).');
            }
        } catch (err) {
            // This catch block will handle network errors (like actual CORS blockage if the URL was correct but headers missing)
            // or errors thrown from the !response.ok block.
            console.error("Error fetching messages (catch block in fetchMessages):", err);
            setError(err.message || 'An unknown error occurred while fetching messages. Check network connection and server logs.');
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
            // *** POTENTIAL FIX: Adjusted URL to include /PET-C2C-PROJECT/ ***
            // *** Verify this is the correct base path for your backend scripts ***
            const response = await fetch('http://localhost/PET-C2C-PROJECT/TailTrade/Backend/send_message.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender_id: currentUserId,
                    receiver_id: otherUserId,
                    message_content: messageContent,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.message);
            }
            const data = await response.json();
            if (data.success) {
                fetchMessages(); 
                setError(null); 
            } else {
                setError(data.message || 'Failed to send message.');
            }
        } catch (err) {
            console.error("Error sending message:", err);
            setError(err.message);
        }
    };

    // --- JSX remains the same as previous version, focusing on the fetch URL ---
    if (authLoading) {
        return (
            <div className="container mx-auto px-4 py-8 font-inter text-center">
                <p className="text-lg text-gray-600 mt-20">Loading authentication...</p>
            </div>
        );
    }

    if (!currentUserId && !authLoading) { 
        return (
            <div className="container mx-auto px-4 py-8 font-inter text-center">
                <p className="text-red-500 mt-20">Authentication required. Please log in to access messaging.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="mt-4 px-6 py-2 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all"
                    style={{ backgroundColor: 'var(--color-primary, #F97316)' }}
                >
                    Go to Login
                </button>
            </div>
        );
    }
    
    if ((!otherUserId && error !== "You cannot message yourself.") || (error && error !== "You cannot message yourself." && messages.length === 0 && !loadingMessages) ) {
        return (
            <div className="container mx-auto px-4 py-8 font-inter text-center">
                 <div className="mt-20 p-6 bg-white shadow-lg rounded-lg max-w-md mx-auto">
                    <h2 className="text-xl font-semibold text-red-700 mb-4">Messaging Error</h2>
                    <p className="text-md text-gray-700 mb-6">
                        {error || "Please select a user to message from a listing."}
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        If the problem persists, please ensure the backend server is running and accessible at the correct URL. Check browser console and server logs for more details.
                    </p>
                    <button
                        onClick={() => navigate('/Menu')} 
                        className="mt-4 px-6 py-2 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all"
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
            <div className="container mx-auto px-4 py-8 font-inter flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
                <div className="bg-white shadow-xl rounded-lg flex flex-col flex-grow max-w-2xl mx-auto w-full overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Chat with {otherUserName}
                        </h2>
                    </div>

                    {loadingMessages && messages.length === 0 && <p className="text-center py-10 text-gray-500">Loading messages...</p>}
                    
                    {error && error !== "You cannot message yourself." && !loadingMessages && messages.length === 0 && (
                         <p className="text-center text-red-600 py-4 px-2 bg-red-50 border-b border-red-200">{error}</p>
                    )}
                    
                    {currentUserId && otherUserId && error !== "You cannot message yourself." && (
                        <>
                            <MessageList messages={messages} currentUserId={currentUserId} />
                            <MessageForm onSendMessage={handleSendMessage} />
                        </>
                    )}

                     {error === "You cannot message yourself." && (
                        <div className="p-10 text-center text-gray-600 flex-grow flex items-center justify-center">
                            You cannot send messages to yourself.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default MessagingPage;
