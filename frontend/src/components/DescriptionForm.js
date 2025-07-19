import React, { useState } from "react";
import axios from "axios";
import { getEndpointUrl } from "../config/api";

function DescriptionForm({ onResult, loading, setLoading }) {
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
    // Clear validation error when user starts typing
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
      const response = await axios.post(getEndpointUrl('GENERATE_DESCRIPTION'), {
        title: formData.title.trim(),
        features: formData.features.trim(),
        tone: formData.tone
      });
      
      if (response.data.descriptions && response.data.descriptions.length > 0) {
        // Pass both the description and the input data
        onResult(response.data.descriptions[0], {
          title: formData.title.trim(),
          features: formData.features.trim(),
          tone: formData.tone
        });
        
        // Clear form after successful generation
        setFormData({
          title: "",
          features: "",
          tone: "professional"
        });
      } else {
        throw new Error('No descriptions generated');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      const errorMessage = error.response?.data?.error || 'Failed to generate description. Please try again.';
      setValidationErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-hover p-8">
      {/* AI Agent Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🤖</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              AI Product Description Agent
            </h2>
            <p className="text-gray-600">I'll help you create compelling product descriptions</p>
          </div>
        </div>
      </div>

      {/* Agent Interface */}
      <div className="space-y-6">
        {/* Agent Message */}
        <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-primary-500">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">AI</span>
            </div>
            <div className="flex-1">
              <p className="text-gray-700 text-sm">
                Hi! I'm your AI assistant. Please provide me with your product details and I'll generate a compelling description for you.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              id="title"
              className={`input-field ${validationErrors.title ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''}`}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Wireless Bluetooth Headphones"
              maxLength={200}
            />
            {validationErrors.title && (
              <p className="mt-1 text-sm text-error-600">{validationErrors.title}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Product Features */}
          <div>
            <label htmlFor="features" className="block text-sm font-semibold text-gray-700 mb-2">
              Product Features *
            </label>
            <textarea
              id="features"
              className={`textarea-field ${validationErrors.features ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''}`}
              value={formData.features}
              onChange={(e) => handleInputChange('features', e.target.value)}
              placeholder="Describe the key features of your product (e.g., Wireless connectivity, Noise cancellation, 30-hour battery life, Premium sound quality, Comfortable ear cushions)"
              rows="4"
              maxLength={1000}
            />
            {validationErrors.features && (
              <p className="mt-1 text-sm text-error-600">{validationErrors.features}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.features.length}/1000 characters
            </p>
          </div>

          {/* Tone Selection */}
          <div>
            <label htmlFor="tone" className="block text-sm font-semibold text-gray-700 mb-2">
              Writing Tone
            </label>
            <select
              id="tone"
              className="select-field"
              value={formData.tone}
              onChange={(e) => handleInputChange('tone', e.target.value)}
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="fun">Fun & Casual</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Choose the tone that best matches your brand voice
            </p>
          </div>

          {/* Error Display */}
          {validationErrors.general && (
            <div className="p-4 bg-error-50 border border-error-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-error-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">!</span>
                </div>
                <p className="text-sm text-error-700">{validationErrors.general}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            className="btn-primary w-full py-4 text-lg font-semibold"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="loading-spinner w-5 h-5"></div>
                <span>AI is generating your description...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>🤖</span>
                <span>Generate AI Description</span>
              </div>
            )}
          </button>
        </form>

        {/* Agent Tips */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center space-x-2">
            <span>💡</span>
            <span>AI Agent Tips</span>
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <span>Be specific about your product's unique features</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <span>Include technical specifications and benefits</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <span>Mention target audience and use cases</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DescriptionForm;