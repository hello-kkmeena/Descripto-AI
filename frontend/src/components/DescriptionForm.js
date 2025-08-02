import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/apiService";
import { GENERATE_ENDPOINTS } from "../config/apiConfig";

function DescriptionForm({ onResult, loading, setLoading }) {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    features: "",
    tone: "professional"
  });
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = "Product name is required";
    } else if (formData.title.length > 200) {
      errors.title = "Product name must be less than 200 characters";
    }
    
    if (!formData.features.trim()) {
      errors.features = "Product features are required";
    } else if (formData.features.length > 1000) {
      errors.features = "Features must be less than 1000 characters";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const requestData = {
        productName: formData.title.trim(),
        productFeature: formData.features.trim(),
        tone: { name: formData.tone }
      };

      const response = await (isAuthenticated
        ? ApiService.fetchWithAuth(GENERATE_ENDPOINTS.DESCRIPTION, {
            method: 'POST',
            body: JSON.stringify(requestData)
          })
        : ApiService.fetchWithoutAuth(GENERATE_ENDPOINTS.DESCRIPTION, {
            method: 'POST',
            body: JSON.stringify(requestData)
          }));
      
      if (response.success && response.data.content && response.data.content.length > 0) {
        onResult(response.data.content, {
          title: formData.title.trim(),
          features: formData.features.trim(),
          tone: formData.tone
        });
        
        setFormData({
          title: "",
          features: "",
          tone: "professional"
        });
      } else {
        throw new Error(response.message || 'No descriptions generated');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      const errorMessage = error.message || 'Failed to generate description. Please try again.';
      setValidationErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white shadow-lg rounded-xl py-6 px-4 md:px-8">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4 max-w-7xl mx-auto">
        {/* Product Name */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            id="title"
            className={`w-full px-4 py-2 rounded-lg border ${
              validationErrors.title 
                ? 'border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-blue-200'
            } focus:border-blue-500 focus:ring-4 transition-all duration-200`}
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Wireless Headphones"
            maxLength={200}
          />
          {validationErrors.title && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.title}</p>
          )}
        </div>

        {/* Product Features */}
        <div className="flex-[2] min-w-[300px]">
          <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-1">
            Product Features
          </label>
          <input
            type="text"
            id="features"
            className={`w-full px-4 py-2 rounded-lg border ${
              validationErrors.features 
                ? 'border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-blue-200'
            } focus:border-blue-500 focus:ring-4 transition-all duration-200`}
            value={formData.features}
            onChange={(e) => handleInputChange('features', e.target.value)}
            placeholder="e.g., Noise cancellation, 30-hour battery, Premium sound"
            maxLength={1000}
          />
          {validationErrors.features && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.features}</p>
          )}
        </div>

        {/* Tone Selection */}
        <div className="w-[200px]">
          <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
            Tone
          </label>
          <select
            id="tone"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
            value={formData.tone}
            onChange={(e) => handleInputChange('tone', e.target.value)}
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="fun">Fun & Casual</option>
          </select>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed h-[42px] min-w-[160px] flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
              <span>Generating...</span>
            </div>
          ) : (
            <span>Generate</span>
          )}
        </button>
      </form>

      {/* Error Display */}
      {validationErrors.general && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{validationErrors.general}</p>
        </div>
      )}
    </div>
  );
}

export default DescriptionForm;