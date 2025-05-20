// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [authLoading, setAuthLoading] = useState(true); // To handle initial check
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Add explicit authenticated state

    // Check for authenticated user on initial load
    useEffect(() => {
        const checkAuthStatus = () => {
            const storedUserId = localStorage.getItem('loggedInUserId');
            if (storedUserId) {
                setLoggedInUserId(parseInt(storedUserId, 10));
                setIsAuthenticated(true);
            } else {
                setLoggedInUserId(null);
                setIsAuthenticated(false);
            }
            setAuthLoading(false);
        };
        
        checkAuthStatus();
    }, []);

    const login = (userId) => {
        setLoggedInUserId(userId);
        setIsAuthenticated(true);
        localStorage.setItem('loggedInUserId', userId.toString());
    };

    const logout = () => {
        setLoggedInUserId(null);
        setIsAuthenticated(false);
        localStorage.removeItem('loggedInUserId');
        localStorage.removeItem('fullUser'); // Also clear the full user data
    };

    return (
        <AuthContext.Provider value={{ 
            loggedInUserId, 
            login, 
            logout, 
            authLoading,
            isAuthenticated // Explicitly export authentication state
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