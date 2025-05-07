import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const CreateListing = () => {
  const [userData, setUserData] = useState(null);
  const [listingType, setListingType] = useState('pet'); // Default to pet listing
  const [formData, setFormData] = useState({
    // Pet form fields
    name: '',
    type: 'dog',
    breed: '',
    age: '',
    price: '',
    location: '',
    description: '',
    image_url: '',
    
    // Supply form fields
    itemName: '',
    condition: 'new',
    itemPrice: '',
    itemLocation: '',
    itemDescription: '',
    itemImage_url: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  // Load user data from localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUserData(JSON.parse(user));
    } else {
      // If not logged in, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const validatePetForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Pet name is required';
    }
    
    if (!formData.breed.trim()) {
      newErrors.breed = 'Breed is required';
    }
    
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || parseInt(formData.age) < 0) {
      newErrors.age = 'Age must be a valid number';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a valid number';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.image_url.trim()) {
      newErrors.image_url = 'Image URL is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSupplyForm = () => {
    const newErrors = {};
    
    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }
    
    if (!formData.itemPrice.trim()) {
      newErrors.itemPrice = 'Price is required';
    } else if (isNaN(formData.itemPrice) || parseFloat(formData.itemPrice) < 0) {
      newErrors.itemPrice = 'Price must be a valid number';
    }
    
    if (!formData.itemLocation.trim()) {
      newErrors.itemLocation = 'Location is required';
    }
    
    if (!formData.itemDescription.trim()) {
      newErrors.itemDescription = 'Description is required';
    }
    
    if (!formData.itemImage_url.trim()) {
      newErrors.itemImage_url = 'Image URL is required';
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

  const handleListingTypeChange = (e) => {
    setListingType(e.target.value);
    // Clear any previous error or success messages
    setSubmitMessage({ type: '', message: '' });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form based on listing type
    const isValid = listingType === 'pet' ? validatePetForm() : validateSupplyForm();
    
    if (!isValid) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });
    
    try {
      let endpoint;
      let requestData;
      
      if (listingType === 'pet') {
        endpoint = 'http://localhost/PET-C2C-PROJECT/TailTrade/Backend/list_pet.php';
        requestData = {
          owner_id: userData.id,
          name: formData.name,
          type: formData.type,
          breed: formData.breed,
          age: formData.age,
          price: formData.price,
          location: formData.location,
          description: formData.description,
          image_url: formData.image_url
        };
      } else {
        endpoint = 'http://localhost/PET-C2C-PROJECT/TailTrade/Backend/list_supply.php';
        requestData = {
          owner_id: userData.id,
          name: formData.itemName,
          condition: formData.condition,
          price: formData.itemPrice,
          location: formData.itemLocation,
          description: formData.itemDescription,
          image_url: formData.itemImage_url
        };
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitMessage({
          type: 'success',
          message: listingType === 'pet' ? 'Pet listed successfully!' : 'Item listed successfully!'
        });
        
        // Clear form after successful submission
        if (listingType === 'pet') {
          setFormData(prevState => ({
            ...prevState,
            name: '',
            type: 'dog',
            breed: '',
            age: '',
            price: '',
            location: '',
            description: '',
            image_url: ''
          }));
        } else {
          setFormData(prevState => ({
            ...prevState,
            itemName: '',
            condition: 'new',
            itemPrice: '',
            itemLocation: '',
            itemDescription: '',
            itemImage_url: ''
          }));
        }
        
        // Redirect to homepage after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
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
            <h1 className="text-2xl font-bold mb-6">Make a Listing</h1>
            
            {/* Listing Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to list?
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="listingType"
                    value="pet"
                    checked={listingType === 'pet'}
                    onChange={handleListingTypeChange}
                    className="form-radio h-4 w-4 text-orange-500"
                  />
                  <span className="ml-2">Pet</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="listingType"
                    value="supply"
                    checked={listingType === 'supply'}
                    onChange={handleListingTypeChange}
                    className="form-radio h-4 w-4 text-orange-500"
                  />
                  <span className="ml-2">Pet Supply/Item</span>
                </label>
              </div>
            </div>
            
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
              {/* Pet Listing Form */}
              {listingType === 'pet' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Pet Name
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
                  
                  <div className="mb-4">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Pet Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
                      Breed
                    </label>
                    <input
                      type="text"
                      id="breed"
                      name="breed"
                      value={formData.breed}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.breed ? 'border-red-300' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                    />
                    {errors.breed && (
                      <p className="mt-1 text-sm text-red-600">{errors.breed}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                        Age (in years)
                      </label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          errors.age ? 'border-red-300' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                        min="0"
                      />
                      {errors.age && (
                        <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Price (ZAR)
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          errors.price ? 'border-red-300' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                        min="0"
                        step="0.01"
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.location ? 'border-red-300' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="e.g., Cape Town, South Africa"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className={`w-full px-3 py-2 border ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="Describe your pet..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      id="image_url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.image_url ? 'border-red-300' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="https://example.com/pet-image.jpg"
                    />
                    {errors.image_url && (
                      <p className="mt-1 text-sm text-red-600">{errors.image_url}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      Note: In a production app, we would implement direct image uploads. For now, please provide a URL to an existing image.
                    </p>
                  </div>
                </>
              )}
              
              {/* Pet Supply/Item Listing Form */}
              {listingType === 'supply' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      id="itemName"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.itemName ? 'border-red-300' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                    />
                    {errors.itemName && (
                      <p className="mt-1 text-sm text-red-600">{errors.itemName}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                      Condition
                    </label>
                    <select
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="new">New</option>
                      <option value="like-new">Like New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="used">Used</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Price (ZAR)
                    </label>
                    <input
                      type="number"
                      id="itemPrice"
                      name="itemPrice"
                      value={formData.itemPrice}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.itemPrice ? 'border-red-300' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                      min="0"
                      step="0.01"
                    />
                    {errors.itemPrice && (
                      <p className="mt-1 text-sm text-red-600">{errors.itemPrice}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="itemLocation" className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      id="itemLocation"
                      name="itemLocation"
                      value={formData.itemLocation}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.itemLocation ? 'border-red-300' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="e.g., Cape Town, South Africa"
                    />
                    {errors.itemLocation && (
                      <p className="mt-1 text-sm text-red-600">{errors.itemLocation}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="itemDescription"
                      name="itemDescription"
                      value={formData.itemDescription}
                      onChange={handleChange}
                      rows="4"
                      className={`w-full px-3 py-2 border ${
                        errors.itemDescription ? 'border-red-300' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="Describe your item..."
                    />
                    {errors.itemDescription && (
                      <p className="mt-1 text-sm text-red-600">{errors.itemDescription}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="itemImage_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      id="itemImage_url"
                      name="itemImage_url"
                      value={formData.itemImage_url}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.itemImage_url ? 'border-red-300' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="https://example.com/item-image.jpg"
                    />
                    {errors.itemImage_url && (
                      <p className="mt-1 text-sm text-red-600">{errors.itemImage_url}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      Note: In a production app, we would implement direct image uploads. For now, please provide a URL to an existing image.
                    </p>
                  </div>
                </>
              )}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-md text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {isSubmitting ? 'Submitting...' : 'Create Listing'}
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

export default CreateListing;