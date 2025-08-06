import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/apiService";
import { GENERATE_ENDPOINTS } from "../config/apiConfig";

function DescriptionForm({ loading, setLoading }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    features: "",
    tone: "professional",
    charCount: 300
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
      // Navigate to agent page with form data
      navigate('/agent', { 
        state: { 
          initialInput: {
            productName: formData.title.trim(),
            features: formData.features.trim(),
            tone: formData.tone,
            charCount: formData.charCount
          }
        }
      });

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.message || 'An error occurred. Please try again.';
      setValidationErrors({ general: errorMessage });
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white shadow-lg rounded-xl py-4 sm:py-6 px-3 sm:px-6 md:px-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-7xl mx-auto">
        {/* Product Name */}
        <div className="flex-1">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            id="title"
            className={`w-full px-3 sm:px-4 py-2 rounded-lg border ${
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
        <div className="flex-1">
          <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-1">
            Product Features
          </label>
          <input
            type="text"
            id="features"
            className={`w-full px-3 sm:px-4 py-2 rounded-lg border ${
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

        {/* Bottom Section - Tone, Character Count and Submit */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          {/* Tone Selection */}
          <div className="w-full sm:w-[180px] md:w-[200px] order-1 sm:order-none">
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
              Tone
            </label>
            <select
              id="tone"
              className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
              value={formData.tone}
              onChange={(e) => handleInputChange('tone', e.target.value)}
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="fun">Fun & Casual</option>
            </select>
          </div>

          {/* Character Count */}
          <div className="w-full sm:w-[180px] md:w-[200px] order-1 sm:order-none">
            <label htmlFor="charCount" className="block text-sm font-medium text-gray-700 mb-1">
              Character Count
            </label>
            <input
              type="number"
              id="charCount"
              className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
              value={formData.charCount}
              onChange={(e) => handleInputChange('charCount', Math.max(50, Math.min(1000, parseInt(e.target.value) || 300)))}
              min="50"
              max="1000"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed h-[42px] min-w-[140px] sm:min-w-[160px] flex items-center justify-center order-2 sm:order-none"
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
        </div>
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