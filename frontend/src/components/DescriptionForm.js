import React, { useState } from "react";
import axios from "axios";
import { getEndpointUrl } from "../config/api";

function DescriptionForm({ onResult, onFormDataChange, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    targetAudience: "",
    keyFeatures: "",
    price: "",
    brand: ""
  });
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    } else if (formData.name.length > 100) {
      errors.name = "Name must be less than 100 characters";
    }
    
    if (!formData.category.trim()) {
      errors.category = "Product category is required";
    }
    
    if (!formData.targetAudience.trim()) {
      errors.targetAudience = "Target audience is required";
    }
    
    if (!formData.keyFeatures.trim()) {
      errors.keyFeatures = "Key features are required";
    } else if (formData.keyFeatures.length > 500) {
      errors.keyFeatures = "Features must be less than 500 characters";
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

    // Prepare data for API
    const productInfo = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      targetAudience: formData.targetAudience.trim(),
      keyFeatures: formData.keyFeatures.split(',').map(feature => feature.trim()).filter(Boolean),
      price: formData.price.trim(),
      brand: formData.brand.trim()
    };
    
    if (onFormDataChange) {
      onFormDataChange(productInfo);
    }
    
    onResult(productInfo);
  };

  return (
    <div className="card card-hover p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Generate Product Descriptions
        </h2>
        <p className="text-gray-600 text-lg">
          Transform your product details into compelling descriptions that drive sales
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            className={`input-field ${validationErrors.name ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''}`}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Wireless Bluetooth Headphones"
            maxLength={100}
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-error-600">{validationErrors.name}</p>
          )}
        </div>

        {/* Category and Brand Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
              Product Category *
            </label>
            <select
              id="category"
              className={`select-field ${validationErrors.category ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''}`}
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing & Fashion">Clothing & Fashion</option>
              <option value="Home & Garden">Home & Garden</option>
              <option value="Sports & Outdoors">Sports & Outdoors</option>
              <option value="Beauty & Personal Care">Beauty & Personal Care</option>
              <option value="Books & Media">Books & Media</option>
              <option value="Toys & Games">Toys & Games</option>
              <option value="Automotive">Automotive</option>
              <option value="Health & Wellness">Health & Wellness</option>
              <option value="Other">Other</option>
            </select>
            {validationErrors.category && (
              <p className="mt-1 text-sm text-error-600">{validationErrors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="brand" className="block text-sm font-semibold text-gray-700 mb-2">
              Brand (Optional)
            </label>
            <input
              type="text"
              id="brand"
              className="input-field"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="e.g., Apple, Nike, Samsung"
            />
          </div>
        </div>

        {/* Target Audience */}
        <div>
          <label htmlFor="targetAudience" className="block text-sm font-semibold text-gray-700 mb-2">
            Target Audience *
          </label>
          <select
            id="targetAudience"
            className={`select-field ${validationErrors.targetAudience ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''}`}
            value={formData.targetAudience}
            onChange={(e) => handleInputChange('targetAudience', e.target.value)}
          >
            <option value="">Select target audience</option>
            <option value="Professionals">Professionals</option>
            <option value="Students">Students</option>
            <option value="Fitness Enthusiasts">Fitness Enthusiasts</option>
            <option value="Tech Savvy Users">Tech Savvy Users</option>
            <option value="Parents & Families">Parents & Families</option>
            <option value="Outdoor Adventurers">Outdoor Adventurers</option>
            <option value="Fashion Conscious">Fashion Conscious</option>
            <option value="Budget Conscious">Budget Conscious</option>
            <option value="Luxury Buyers">Luxury Buyers</option>
            <option value="General Consumers">General Consumers</option>
          </select>
          {validationErrors.targetAudience && (
            <p className="mt-1 text-sm text-error-600">{validationErrors.targetAudience}</p>
          )}
        </div>

        {/* Key Features */}
        <div>
          <label htmlFor="keyFeatures" className="block text-sm font-semibold text-gray-700 mb-2">
            Key Features *
          </label>
          <textarea
            id="keyFeatures"
            className={`textarea-field ${validationErrors.keyFeatures ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''}`}
            value={formData.keyFeatures}
            onChange={(e) => handleInputChange('keyFeatures', e.target.value)}
            placeholder="Enter key features separated by commas (e.g., Wireless, Noise Cancelling, 30-hour battery life, Premium sound quality)"
            rows="4"
            maxLength={500}
          />
          {validationErrors.keyFeatures && (
            <p className="mt-1 text-sm text-error-600">{validationErrors.keyFeatures}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.keyFeatures.length}/500 characters
          </p>
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
            Price Range (Optional)
          </label>
          <select
            id="price"
            className="select-field"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
          >
            <option value="">Select price range</option>
            <option value="Under $25">Under $25</option>
            <option value="$25 - $50">$25 - $50</option>
            <option value="$50 - $100">$50 - $100</option>
            <option value="$100 - $250">$100 - $250</option>
            <option value="$250 - $500">$250 - $500</option>
            <option value="$500 - $1000">$500 - $1000</option>
            <option value="Over $1000">Over $1000</option>
          </select>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          className="btn-primary w-full py-4 text-lg font-semibold"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="loading-spinner w-5 h-5"></div>
              <span>Generating Description...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>✨</span>
              <span>Generate AI Description</span>
            </div>
          )}
        </button>
      </form>

      {/* Features Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">What you'll get:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span>Compelling product description</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <span>Key features & benefits</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
            <span>SEO-optimized content</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Target audience focused</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DescriptionForm;