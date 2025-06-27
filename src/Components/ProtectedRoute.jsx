// src/Components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Adjust path if necessary

const ProtectedRoute = () => {
    const { isAuthenticated, authLoading } = useAuth();

    // While authentication status is being checked (e.g., on initial load)
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-700">Loading authentication...</p>
            </div>
        );
    }

    // If not authenticated, redirect to the login page
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the child routes (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;