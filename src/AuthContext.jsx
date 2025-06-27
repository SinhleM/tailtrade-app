// src/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Change loggedInUserId to a full user object state
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check for authenticated user on initial load
    useEffect(() => {
        const checkAuthStatus = () => {
            const storedUser = localStorage.getItem('user'); // Look for 'user' object
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (e) {
                    console.error("Failed to parse stored user data:", e);
                    // Clear invalid data
                    localStorage.removeItem('user');
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setAuthLoading(false);
        };
        
        checkAuthStatus();
    }, []); // Empty dependency array means this runs once on mount

    // Login function now accepts the full user data object
    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData)); // Store full user object
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user'); // Clear the 'user' object
        // If you store other user-related items, clear them here too
        // localStorage.removeItem('someOtherUserSpecificItem');
    };

    return (
        <AuthContext.Provider value={{ 
            user, // Export the full user object
            login, 
            logout, 
            authLoading,
            isAuthenticated
        }}>
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