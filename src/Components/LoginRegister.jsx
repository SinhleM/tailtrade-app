import { useAuth } from '../AuthContext'; // Assumes AuthContext.jsx is in src/
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config'; // Import the config file

// Make sure this component is exported
const LoginRegister = () => {
  // --- State Variables ---
  const [isLogin, setIsLogin] = useState(true); // Controls whether the form is for login or registration
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer' // Default role for registration - always customer
  });
  const [errors, setErrors] = useState({}); // Stores validation errors
  const [isSubmitting, setIsSubmitting] = useState(false); // Tracks submission status to disable button
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' }); // Feedback message after submission
  const navigate = useNavigate(); // Hook for programmatic navigation

  // --- Form Validation ---
  const validateForm = () => {
    const newErrors = {};

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8 || formData.password.length > 16) {
      newErrors.password = 'Password must be between 8 and 16 characters';
    }

    // For registration, validate name
    if (!isLogin) {
      if (!formData.name.trim()) { // Use trim() to prevent just spaces
        newErrors.name = 'Name is required';
      }
    }

    setErrors(newErrors); // Update the errors state
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // --- Input Change Handler ---
  const handleChange = (e) => {
    const { name, value } = e.target; // Get field name and value
    setFormData(prevState => ({
      ...prevState,
      [name]: value // Update the corresponding field in formData state
    }));
    // Optionally clear the specific error when the user starts typing again
    if (errors[name]) {
        setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };

  // --- Form Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (!validateForm()) return; // Stop submission if validation fails

    setIsSubmitting(true); // Disable submit button
    setSubmitMessage({ type: '', message: '' }); // Clear previous messages

    const endpoint = isLogin ? config.endpoints.LOGIN : config.endpoints.REGISTER;
    // Use the config file for the complete URL
    const url = `${config.API_BASE_URL}/${endpoint}`;

    try {
      // Send POST request using Axios
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      });

      const data = response.data; // Response data from PHP script

      if (data.success) {
        setSubmitMessage({
          type: 'success',
          message: isLogin ? 'Login successful!' : 'Registration successful!'
        });
        // Store user data in localStorage upon successful login/registration
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect to homepage after a delay
        setTimeout(() => {
          navigate('/');
          // Optionally reload to ensure header updates if needed
          // window.location.reload();
        }, 1500);
      } else {
        // Display error message from the backend
        setSubmitMessage({
          type: 'error',
          message: data.message || 'An error occurred'
        });
      }
    } catch (error) {
      // Handle network errors or errors thrown by Axios/server
      let errorMessage = 'Server error. Please try again later.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your connection.';
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message; // Prefer backend error message
      } else if (error.request) {
        errorMessage = 'Network error or server did not respond.';
        console.error('Network Error:', error.request);
      } else {
        console.error('Axios Setup Error:', error.message);
      }

      setSubmitMessage({ type: 'error', message: errorMessage });
      console.error('Error during API call:', error); // Log detailed error
    } finally {
      setIsSubmitting(false); // Re-enable submit button
    }
  };

  // --- Toggle between Login and Register Forms ---
  const toggleForm = () => {
    setIsLogin(!isLogin); // Switch the mode
    // Reset form fields and errors when switching
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'customer' // Always reset to customer role
    });
    setErrors({});
    setSubmitMessage({ type: '', message: '' }); // Clear any previous messages
  };

  // --- JSX Rendering ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {/* Logo and Title */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <div className="mr-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}>
                <span className="text-white font-bold">T</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold italic bg-gradient-to-r from-gray-950 via-gray-800 to-gray-800 bg-[length:250%_100%] bg-right bg-clip-text text-transparent">
              TailTrade
            </h1>
          </div>
        </div>

        {/* Form Title */}
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </h2>

        {/* Submission Feedback Message */}
        {submitMessage.message && (
          <div
            className={`mt-4 p-3 rounded-md text-center ${
              submitMessage.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {submitMessage.message}
          </div>
        )}

        {/* Form Element */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Name Field (only for Registration) */}
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name" // name attribute must match state key
                type="text"
                value={formData.name}
                onChange={handleChange} // Connects input changes to state
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300' // Dynamic border based on error
                } rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                aria-invalid={errors.name ? "true" : "false"} // Accessibility
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && ( // Display error message if exists
                <p id="name-error" className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email" // name attribute must match state key
              type="email"
              value={formData.email}
              onChange={handleChange} // Connects input changes to state
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password" // name attribute must match state key
              type="password"
              value={formData.password}
              onChange={handleChange} // Connects input changes to state
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
             {errors.password && (
               <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>
             )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit" // Triggers the form's onSubmit
              disabled={isSubmitting} // Disable button during submission
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50" // Added disabled style
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isSubmitting ? 'Processing...' : (isLogin ? 'Sign in' : 'Register')}
            </button>
          </div>
        </form>

        {/* Toggle Form Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button" // Important: type="button" prevents form submission
              onClick={toggleForm} // Connects click to toggle function
              className="font-medium hover:text-orange-500 focus:outline-none focus:underline transition-colors"
              style={{ color: 'var(--color-primary)' }}
            >
              {isLogin ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}; // End of LoginRegister component function

export default LoginRegister;