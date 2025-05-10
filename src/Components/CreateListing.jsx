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
        endpoint = 'http://localhost/PET-C2C-PROJECT/TailTrade/Backend/list_supplies.php';
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
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header scrollToSection={scrollToSection} />
      
      <div className="flex-grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Listing</h1>
            
            {/* Listing Type Selector */}
            <div className="mb-8">
              <label className="block text-base font-medium text-gray-700 mb-3">
                What would you like to list?
              </label>
              <div className="flex space-x-6">
                <label className="inline-flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="listingType"
                    value="pet"
                    checked={listingType === 'pet'}
                    onChange={handleListingTypeChange}
                    className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300"
                  />
                  <span className="text-gray-700">Pet</span>
                </label>
                <label className="inline-flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="listingType"
                    value="supply"
                    checked={listingType === 'supply'}
                    onChange={handleListingTypeChange}
                    className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300"
                  />
                  <span className="text-gray-700">Pet Supply/Item</span>
                </label>
              </div>
            </div>
            
            {submitMessage.message && (
              <div 
                className={`mb-6 p-4 rounded-lg ${
                  submitMessage.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {submitMessage.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pet Listing Form */}
              {listingType === 'pet' && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Pet Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2.5 rounded-lg border ${
                        errors.name ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'
                      } focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`}
                      placeholder="e.g., Max"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Pet Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-orange-500 shadow-sm"
                    >
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Breed <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="breed"
                      name="breed"
                      value={formData.breed}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2.5 rounded-lg border ${
                        errors.breed ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'
                      } focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`}
                      placeholder="e.g., Labrador Retriever"
                    />
                    {errors.breed && (
                      <p className="mt-2 text-sm text-red-600">{errors.breed}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Age (years) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className={`block w-full px-4 py-2.5 rounded-lg border ${
                          errors.age ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'
                        } focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`}
                        min="0"
                        placeholder="e.g., 3"
                      />
                      {errors.age && (
                        <p className="mt-2 text-sm text-red-600">{errors.age}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Price (ZAR) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className={`block w-full px-4 py-2.5 rounded-lg border ${
                          errors.price ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'
                        } focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`}
                        min="0"
                        step="0.01"
                        placeholder="e.g., 1500.00"
                      />
                      {errors.price && (
                        <p className="mt-2 text-sm text-red-600">{errors.price}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2.5 rounded-lg border ${
                        errors.location ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'
                      } focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`}
                      placeholder="e.g., Cape Town, South Africa"
                    />
                    {errors.location && (
                      <p className="mt-2 text-sm text-red-600">{errors.location}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className={`block w-full px-4 py-2.5 rounded-lg border ${
                        errors.description ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'
                      } focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`}
                      placeholder="Tell us about your pet's personality, health, etc."
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Image URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="image_url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2.5 rounded-lg border ${
                        errors.image_url ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'
                      } focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`}
                      placeholder="https://example.com/pet-image.jpg"
                    />
                    {errors.image_url && (
                      <p className="mt-2 text-sm text-red-600">{errors.image_url}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      Note: Please provide a URL to an existing image of your pet.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Pet Supply/Item Listing Form */}
              {listingType === 'supply' && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="itemName"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2.5 rounded-lg border ${
                        errors.itemName ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'
                      } focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`}
                      placeholder="e.g., Dog Bed"
                    />
                    {errors.itemName && (
                      <p className="mt-2 text-sm text-red-600">{errors.itemName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Condition
                    </label>
                    <select
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-orange-500 shadow-sm"
                    >
                      <option value="new">New</option>
                      <option value="like-new">Like New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="used">Used</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Price (ZAR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="itemPrice"
                      name="itemPrice"
                      value={formData.itemPrice}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2.5 rounded-lg border ${
                        errors.itemPrice ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'
                      } focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`}
                      min="0"
                      step="0.01"
                      placeholder="e.g., 499.99"
                    />
                    {errors.itemPrice && (
                      <p className="mt-2 text-sm text-red-600">{errors.itemPrice}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="itemLocation" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="itemLocation"
                      name="itemLocation"
                      value={formData.itemLocation}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2.5 rounded-lg border ${
                        errors.itemLocation ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'
                      } focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`}
                      placeholder="e.g., Johannesburg, South Africa"
                    />
                    {errors.itemLocation && (
                      <p className="mt-2 text-sm text-red-600">{errors.itemLocation}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="itemDescription"
                      name="itemDescription"
                      value={formData.itemDescription}
                      onChange={handleChange}
                      rows="4"
                      className={`block w-full px-4 py-2.5 rounded-lg border ${
                        errors.itemDescription ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'
                      } focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`}
                      placeholder="Describe the item's features, condition, etc."
                    />
                    {errors.itemDescription && (
                      <p className="mt-2 text-sm text-red-600">{errors.itemDescription}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="itemImage_url" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Image URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="itemImage_url"
                      name="itemImage_url"
                      value={formData.itemImage_url}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2.5 rounded-lg border ${
                        errors.itemImage_url ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'
                      } focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`}
                      placeholder="https://example.com/item-image.jpg"
                    />
                    {errors.itemImage_url && (
                      <p className="mt-2 text-sm text-red-600">{errors.itemImage_url}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      Note: Please provide a URL to an existing image of your item.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : 'Create Listing'}
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