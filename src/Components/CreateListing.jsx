import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header'; // Assuming these exist
import Footer from './Footer'; // Assuming these exist

const CreateListing = () => {
  const [userData, setUserData] = useState(null);
  const [listingType, setListingType] = useState('pet');
  const [formData, setFormData] = useState({
    // Pet form fields
    name: '',
    type: 'dog',
    breed: '',
    age: '',
    price: '',
    location: '',
    description: '',
    // Pet Supply form fields
    itemName: '',
    condition: 'new',
    itemPrice: '',
    itemLocation: '',
    itemDescription: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUserData(JSON.parse(user));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (listingType === 'pet') {
      if (!formData.name.trim()) newErrors.name = 'Pet name is required';
      if (!formData.breed.trim()) newErrors.breed = 'Breed is required';
      if (!formData.age.trim()) newErrors.age = 'Age is required';
      else if (isNaN(formData.age) || parseInt(formData.age) < 0) newErrors.age = 'Age must be a valid number';
      if (!formData.price.trim()) newErrors.price = 'Price is required';
      else if (isNaN(formData.price) || parseFloat(formData.price) < 0) newErrors.price = 'Price must be a valid number';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
    } else { // Supply
      if (!formData.itemName.trim()) newErrors.itemName = 'Item name is required';
      if (!formData.itemPrice.trim()) newErrors.itemPrice = 'Price is required';
      else if (isNaN(formData.itemPrice) || parseFloat(formData.itemPrice) < 0) newErrors.itemPrice = 'Price must be a valid number';
      if (!formData.itemLocation.trim()) newErrors.itemLocation = 'Location is required';
      if (!formData.itemDescription.trim()) newErrors.itemDescription = 'Description is required';
    }

    if (selectedFiles.length === 0) {
      newErrors.images = 'Please upload at least one image.';
    } else if (selectedFiles.length > 5) {
      newErrors.images = 'You can upload a maximum of 5 images.';
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...selectedFiles, ...files].slice(0, 5); 
    setSelectedFiles(newFiles);

    imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);

    if (newFiles.length > 0) {
        setErrors(prevErrors => ({ ...prevErrors, images: null }));
    }
    if (e.target.files.length + selectedFiles.length > 5 && selectedFiles.length < 5) {
         setErrors(prevErrors => ({ ...prevErrors, images: 'You can upload a maximum of 5 images. Some files were not added.' }));
    } else if (newFiles.length >= 5) {
         setErrors(prevErrors => ({ ...prevErrors, images: null }));
    }
     e.target.value = null;
  };

  const removeImage = (indexToRemove) => {
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
    setErrors(prevErrors => ({ ...prevErrors, images: null }));
  };

  const handleListingTypeChange = (e) => {
    setListingType(e.target.value);
    setSubmitMessage({ type: '', message: '' });
    setErrors({});
    setFormData({
        name: '', type: 'dog', breed: '', age: '', price: '', location: '', description: '',
        itemName: '', condition: 'new', itemPrice: '', itemLocation: '', itemDescription: '',
    });
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    setSelectedFiles([]);
    setImagePreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });
    
    const submissionData = new FormData();
    submissionData.append('owner_id', userData.id);

    if (listingType === 'pet') {
      submissionData.append('name', formData.name);
      submissionData.append('type', formData.type);
      submissionData.append('breed', formData.breed);
      submissionData.append('age', formData.age);
      submissionData.append('price', formData.price);
      submissionData.append('location', formData.location);
      submissionData.append('description', formData.description);
    } else { // supply
      submissionData.append('name', formData.itemName); 
      submissionData.append('condition', formData.condition);
      submissionData.append('price', formData.itemPrice); 
      submissionData.append('location', formData.itemLocation); 
      submissionData.append('description', formData.itemDescription); 
    }

    selectedFiles.forEach((file) => {
      submissionData.append('images[]', file); 
    });

    const endpoint = listingType === 'pet'
      ? 'http://localhost/PET-C2C-PROJECT/TailTrade/Backend/list_pet.php'
      : 'http://localhost/PET-C2C-PROJECT/TailTrade/Backend/list_supplies.php';
      
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: submissionData,
      });
      
      const responseText = await response.text(); // Get raw text first

      if (!response.ok) {
        // Server returned an error status (e.g., 400, 404, 500)
        console.error(`Server error ${response.status}: ${response.statusText}`);
        console.error("Raw server response:", responseText);
        let errorMessage = `Server error: ${response.status}.`;
        try {
            // Attempt to parse the responseText as JSON, as our PHP script might send JSON errors
            const errorData = JSON.parse(responseText);
            if (errorData && errorData.message) {
                errorMessage = errorData.message;
            } else {
                 errorMessage = `Server error ${response.status}: ${responseText.substring(0, 100)}...`; // Show snippet if not JSON
            }
        } catch (e) {
            // If parsing fails, it means the error response was not JSON (e.g., HTML error page)
            errorMessage = `Server returned non-JSON error. Status: ${response.status}. Check console for raw response.`;
        }
        setSubmitMessage({ type: 'error', message: errorMessage });
        setIsSubmitting(false); // Ensure submission state is reset
        return; // Stop further processing
      }

      // If response.ok is true, try to parse the text as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        console.error('Raw response text for successful (2xx) response:', responseText);
        setSubmitMessage({
          type: 'error',
          message: 'Received malformed data from server despite a success status. Please try again.'
        });
        setIsSubmitting(false); // Ensure submission state is reset
        return; // Stop further processing
      }
      
      // Proceed with data if parsing was successful
      if (data.success) {
        setSubmitMessage({
          type: 'success',
          message: listingType === 'pet' ? 'Pet listed successfully!' : 'Item listed successfully!'
        });
        setFormData({
            name: '', type: 'dog', breed: '', age: '', price: '', location: '', description: '',
            itemName: '', condition: 'new', itemPrice: '', itemLocation: '', itemDescription: '',
        });
        imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
        setSelectedFiles([]);
        setImagePreviews([]);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setSubmitMessage({
          type: 'error',
          message: data.message || 'An unspecified error occurred on the server.'
        });
      }
    } catch (networkError) { // Catches network errors (e.g., server down, DNS issues)
      setSubmitMessage({
        type: 'error',
        message: 'Network issue or server unreachable. Please check your connection and try again.'
      });
      console.error('Network error submitting form:', networkError);
    } finally {
      setIsSubmitting(false);
    }
  };

   useEffect(() => {
    // Cleanup object URLs on component unmount
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]); // Add imagePreviews to dependency array if it can change and needs cleanup

  if (!userData) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const scrollToSection = (sectionId) => (event) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header scrollToSection={scrollToSection} />
      
      <div className="flex-grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Listing</h1>
            
            <div className="mb-8">
              <label className="block text-base font-medium text-gray-700 mb-3">
                What would you like to list?
              </label>
              <div className="flex space-x-6">
                <label className="inline-flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="listingType" value="pet" checked={listingType === 'pet'} onChange={handleListingTypeChange} className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300"/>
                  <span className="text-gray-700">Pet</span>
                </label>
                <label className="inline-flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="listingType" value="supply" checked={listingType === 'supply'} onChange={handleListingTypeChange} className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300"/>
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
              {listingType === 'pet' && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Pet Name <span className="text-red-500">*</span></label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`block w-full px-4 py-2.5 rounded-lg border ${errors.name ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'} focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`} placeholder="e.g., Max"/>
                    {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1.5">Pet Type</label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange} className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-orange-500 shadow-sm">
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1.5">Breed <span className="text-red-500">*</span></label>
                    <input type="text" id="breed" name="breed" value={formData.breed} onChange={handleChange} className={`block w-full px-4 py-2.5 rounded-lg border ${errors.breed ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'} focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`} placeholder="e.g., Labrador Retriever"/>
                    {errors.breed && <p className="mt-2 text-sm text-red-600">{errors.breed}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1.5">Age (years) <span className="text-red-500">*</span></label>
                      <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} min="0" className={`block w-full px-4 py-2.5 rounded-lg border ${errors.age ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'} focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`} placeholder="e.g., 3"/>
                      {errors.age && <p className="mt-2 text-sm text-red-600">{errors.age}</p>}
                    </div>
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5">Price (ZAR) <span className="text-red-500">*</span></label>
                      <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01" className={`block w-full px-4 py-2.5 rounded-lg border ${errors.price ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'} focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`} placeholder="e.g., 1500.00"/>
                      {errors.price && <p className="mt-2 text-sm text-red-600">{errors.price}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">Location <span className="text-red-500">*</span></label>
                    <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} className={`block w-full px-4 py-2.5 rounded-lg border ${errors.location ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'} focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`} placeholder="e.g., Cape Town, South Africa"/>
                    {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" className={`block w-full px-4 py-2.5 rounded-lg border ${errors.description ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'} focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`} placeholder="Tell us about your pet's personality, health, etc."></textarea>
                    {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                  </div>
                </div>
              )}
              
              {listingType === 'supply' && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1.5">Item Name <span className="text-red-500">*</span></label>
                    <input type="text" id="itemName" name="itemName" value={formData.itemName} onChange={handleChange} className={`block w-full px-4 py-2.5 rounded-lg border ${errors.itemName ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'} focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`} placeholder="e.g., Dog Bed"/>
                    {errors.itemName && <p className="mt-2 text-sm text-red-600">{errors.itemName}</p>}
                  </div>
                  <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1.5">Condition</label>
                    <select id="condition" name="condition" value={formData.condition} onChange={handleChange} className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-orange-500 shadow-sm">
                      <option value="new">New</option>
                      <option value="like-new">Like New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="used">Used</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-700 mb-1.5">Price (ZAR) <span className="text-red-500">*</span></label>
                    <input type="number" id="itemPrice" name="itemPrice" value={formData.itemPrice} onChange={handleChange} min="0" step="0.01" className={`block w-full px-4 py-2.5 rounded-lg border ${errors.itemPrice ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'} focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`} placeholder="e.g., 499.99"/>
                    {errors.itemPrice && <p className="mt-2 text-sm text-red-600">{errors.itemPrice}</p>}
                  </div>
                  <div>
                    <label htmlFor="itemLocation" className="block text-sm font-medium text-gray-700 mb-1.5">Location <span className="text-red-500">*</span></label>
                    <input type="text" id="itemLocation" name="itemLocation" value={formData.itemLocation} onChange={handleChange} className={`block w-full px-4 py-2.5 rounded-lg border ${errors.itemLocation ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'} focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`} placeholder="e.g., Johannesburg, South Africa"/>
                    {errors.itemLocation && <p className="mt-2 text-sm text-red-600">{errors.itemLocation}</p>}
                  </div>
                  <div>
                    <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                    <textarea id="itemDescription" name="itemDescription" value={formData.itemDescription} onChange={handleChange} rows="4" className={`block w-full px-4 py-2.5 rounded-lg border ${errors.itemDescription ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-300'} focus:outline-none focus:ring-2 focus:border-orange-500 shadow-sm`} placeholder="Describe the item's features, condition, etc."></textarea>
                    {errors.itemDescription && <p className="mt-2 text-sm text-red-600">{errors.itemDescription}</p>}
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Images (up to 5) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                  disabled={selectedFiles.length >= 5}
                />
                {errors.images && <p className="mt-2 text-sm text-red-600">{errors.images}</p>}
                {selectedFiles.length >= 5 && <p className="mt-1 text-sm text-orange-500">Maximum of 5 images reached.</p>}
                
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {imagePreviews.map((previewUrl, index) => (
                      <div key={index} className="relative group">
                        <img src={previewUrl} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-md border border-gray-200" />
                        <button 
                          type="button" 
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs w-5 h-5 flex items-center justify-center opacity-75 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          &#x2715; 
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
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
