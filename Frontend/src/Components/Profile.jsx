import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  // Load user data from localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);
      setFormData(prevState => ({
        ...prevState,
        name: parsedUser.name
      }));
    } else {
      // If not logged in, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Only validate password fields if they are not empty
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to set a new password';
      }
      
      if (formData.newPassword.length < 8 || formData.newPassword.length > 16) {
        newErrors.newPassword = 'Password must be between 8 and 16 characters';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
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
    
    // Prepare data for the request
    const updateData = {
      id: userData.id,
      name: formData.name
    };
    
    // Only include password fields if new password is provided
    if (formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }
    
    try {
      const response = await fetch('http://localhost/tailtrade/api/update_profile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitMessage({
          type: 'success',
          message: 'Profile updated successfully!'
        });
        
        // Update user data in localStorage
        const updatedUser = {
          ...userData,
          name: formData.name
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        
        // Clear password fields
        setFormData(prevState => ({
          ...prevState,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
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

  // Simple scroll function for footer
  const scrollToSection = (sectionId) => (event) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!userData) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Arial, sans-serif' }}>
      <Header scrollToSection={scrollToSection} />
      
      <div className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold mb-6">My Profile</h1>
            
            {submitMessage.message && (
              <div 
                className={`mb-6 p-3 rounded-md ${
                  submitMessage.type === 'success' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {submitMessage.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={userData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
                <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Change Password (Optional)</h2>
                
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                  />
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.newPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Password must be between 8 and 16 characters</p>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-md text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
};

export default Profile;