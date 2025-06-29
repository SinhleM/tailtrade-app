import { useAuth } from '../AuthContext'; // Assumes AuthContext.jsx is in src/
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config'; // Import the config file

// Make sure this component is exported
const LoginRegister = () => {
  // --- State Variables ---
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer' // Default role for registration - always customer
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
    isValid: false
  });
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const navigate = useNavigate();

  // Get the login function from AuthContext
  const { login } = useAuth();

  // --- Password Strength Validation ---
  const validatePasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    // Check length
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    // Check for uppercase letter
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    // Check for lowercase letter
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    // Check for number
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    // Check for special character
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character (!@#$%^&*...)');
    }

    // Check maximum length
    if (password.length > 16) {
      feedback.push('Maximum 16 characters');
      score = Math.max(0, score - 1);
    }

    return {
      score,
      feedback,
      isValid: score >= 4 && password.length <= 16
    };
  };

  // Update password strength when password changes
  useEffect(() => {
    if (!isLogin && formData.password) {
      const strength = validatePasswordStrength(formData.password);
      setPasswordStrength(strength);
      setShowPasswordStrength(true);
    } else {
      setShowPasswordStrength(false);
    }
  }, [formData.password, isLogin]);

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
    } else if (isLogin) {
      // For login, just check basic length requirements
      if (formData.password.length < 8 || formData.password.length > 16) {
        newErrors.password = 'Password must be between 8 and 16 characters';
      }
    } else {
      // For registration, use strength validation
      const strength = validatePasswordStrength(formData.password);
      if (!strength.isValid) {
        newErrors.password = 'Password does not meet strength requirements';
      }
    }

    // For registration, validate name
    if (!isLogin) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Input Change Handler ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (errors[name]) {
        setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };

  // --- Form Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });

    const endpoint = isLogin ? config.endpoints.LOGIN : config.endpoints.REGISTER;
    const url = `${config.API_BASE_URL}/${endpoint}`;

    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      const data = response.data;

      if (data.success) {
        setSubmitMessage({
          type: 'success',
          message: isLogin ? 'Login successful!' : 'Registration successful!'
        });
        
        // Store user data in localStorage AND update AuthContext state immediately
        localStorage.setItem('user', JSON.stringify(data.user)); // Ensure this matches AuthContext's expectation
        login(data.user); // <--- CALL THE LOGIN FUNCTION FROM AUTHCONTEXT HERE

        // Redirect to homepage after a delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setSubmitMessage({
          type: 'error',
          message: data.message || 'An error occurred'
        });
      }
    } catch (error) {
      let errorMessage = 'Server error. Please try again later.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your connection.';
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        errorMessage = 'Network error or server did not respond.';
        console.error('Network Error:', error.request);
      } else {
        console.error('Axios Setup Error:', error.message);
      }

      setSubmitMessage({ type: 'error', message: errorMessage });
      console.error('Error during API call:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Toggle between Login and Register Forms ---
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'customer'
    });
    setErrors({});
    setSubmitMessage({ type: '', message: '' });
    setPasswordStrength({ score: 0, feedback: [], isValid: false });
    setShowPasswordStrength(false);
  };

  // --- Password Strength Indicator Component ---
  const PasswordStrengthIndicator = () => {
    const getStrengthText = (score) => {
      if (score <= 1) return 'Very Weak';
      if (score <= 2) return 'Weak';
      if (score <= 3) return 'Fair';
      if (score <= 4) return 'Good';
      return 'Strong';
    };

    const getStrengthColor = (score) => {
      if (score <= 1) return 'bg-red-500';
      if (score <= 2) return 'bg-orange-500';
      if (score <= 3) return 'bg-yellow-500';
      if (score <= 4) return 'bg-blue-500';
      return 'bg-green-500';
    };

    const getStrengthTextColor = (score) => {
      if (score <= 1) return 'text-red-600';
      if (score <= 2) return 'text-orange-600';
      if (score <= 3) return 'text-yellow-600';
      if (score <= 4) return 'text-blue-600';
      return 'text-green-600';
    };

    return (
      <div className="mt-2">
        {/* Strength Bar */}
        <div className="flex space-x-1 mb-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-2 flex-1 rounded ${
                level <= passwordStrength.score
                  ? getStrengthColor(passwordStrength.score)
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        
        {/* Strength Text */}
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${getStrengthTextColor(passwordStrength.score)}`}>
            {getStrengthText(passwordStrength.score)}
          </span>
          {passwordStrength.isValid && (
            <span className="text-green-600 text-sm">✓ Valid</span>
          )}
        </div>

        {/* Requirements List */}
        {passwordStrength.feedback.length > 0 && (
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Password must include:</p>
            <ul className="space-y-1">
              {passwordStrength.feedback.map((requirement, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-red-500 mr-2">•</span>
                  {requirement}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

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
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
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
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
            
            {/* Password Strength Indicator (only show during registration) */}
            {showPasswordStrength && !isLogin && (
              <PasswordStrengthIndicator />
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50"
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
              type="button"
              onClick={toggleForm}
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
};

export default LoginRegister;