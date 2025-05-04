import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  
  const navigate = useNavigate();

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
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });
    
    try {
      const endpoint = isLogin ? 'login.php' : 'register.php';
      const response = await fetch(`http://localhost/tailtrade/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitMessage({
          type: 'success',
          message: isLogin ? 'Login successful!' : 'Registration successful!'
        });
        
        // Store user data in localStorage (you might want to use a more secure approach in production)
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to homepage after a short delay
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
      setSubmitMessage({
        type: 'error',
        message: 'Server error. Please try again later.'
      });
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
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
        
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </h2>
        
        {submitMessage.message && (
          <div 
            className={`mt-4 p-3 rounded-md ${
              submitMessage.type === 'success' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}
          >
            {submitMessage.message}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
          )}
          
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
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          
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
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
          
          {!isLogin && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isSubmitting ? (
                'Processing...'
              ) : isLogin ? (
                'Sign in'
              ) : (
                'Register'
              )}
            </button>
          </div>
        </form>
        
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