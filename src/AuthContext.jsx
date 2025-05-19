// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [authLoading, setAuthLoading] = useState(true); // To handle initial check

    // Simulate checking for a logged-in user (e.g., from localStorage or an API call)
    useEffect(() => {
        // In a real app, you'd check localStorage for a token/user ID,
        // or make an API call to verify session.
        const storedUserId = localStorage.getItem('loggedInUserId');
        if (storedUserId) {
            setLoggedInUserId(parseInt(storedUserId, 10));
        }
        setAuthLoading(false); // Finished checking
    }, []);

    const login = (userId) => {
        setLoggedInUserId(userId);
        localStorage.setItem('loggedInUserId', userId.toString()); // Persist for demo
    };

    const logout = () => {
        setLoggedInUserId(null);
        localStorage.removeItem('loggedInUserId');
    };

    return (
        <AuthContext.Provider value={{ loggedInUserId, login, logout, authLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};