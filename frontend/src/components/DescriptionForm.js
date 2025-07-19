import React, { useState } from "react";
import axios from "axios";
import { getEndpointUrl } from "../config/api";

function DescriptionForm({ onResult, onFormDataChange }) {
  const [title, setTitle] = useState("");
  const [features, setFeatures] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!title.trim()) {
      errors.title = "Product title is required";
    } else if (title.length > 200) {
      errors.title = "Title must be less than 200 characters";
    }
    
    if (!features.trim()) {
      errors.features = "Key features are required";
    } else if (features.length > 1000) {
      errors.features = "Features must be less than 1000 characters";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateDescriptions = async () => {
    if (!validateForm()) {
      setError("Please fix the validation errors above.");
      return;
    }

    setLoading(true);
    setError(null);
    
    // Store form data for regeneration
    const formData = {
      title: title.trim(),
      features: features.trim(),
      tone
    };
    
    if (onFormDataChange) {
      onFormDataChange(formData);
    }
    
    try {
      const res = await axios.post(getEndpointUrl('GENERATE_DESCRIPTION'), formData);
      
      if (res.data.descriptions) {
        onResult(res.data.descriptions, formData);
      } else if (res.data.error) {
        setError(res.data.error);
      } else {
        setError("Unexpected server response.");
      }
    } catch (err) {
      console.error("API Error:", err);
      
      // Better error handling with specific messages
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 429) {
          setError("Too many requests. Please wait a moment and try again.");
        } else if (err.response.status === 400) {
          setError(err.response.data.error || "Invalid request. Please check your input.");
        } else if (err.response.status >= 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(err.response.data.error || "Request failed.");
        }
      } else if (err.request) {
        // Network error
        setError("Network error. Please check your connection and try again.");
      } else {
        // Other error
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
    
    // Update the corresponding state
    switch (field) {
      case 'title':
        setTitle(value);
        break;
      case 'features':
        setFeatures(value);
        break;
      case 'tone':
        setTone(value);
        break;
      default:
        break;
    }
  };

  return (
    <section className="form-section">
      <div className="form-container">
        <h2 className="form-title">Generate AI E-commerce Product Descriptions</h2>
        <p className="form-subtitle">
          Transform your product details into compelling descriptions that sell
        </p>
        
        <div className="form-group">
          <div className="input-wrapper">
            <input
              type="text"
              id="product-title"
              className={`form-input ${title ? 'has-value' : ''} ${validationErrors.title ? 'error' : ''}`}
              value={title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              maxLength={200}
            />
            <label htmlFor="product-title" className="floating-label">
              Product Title *
            </label>
            {validationErrors.title && (
              <span className="error-text">{validationErrors.title}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <div className="input-wrapper">
            <textarea
              id="key-features"
              className={`form-textarea ${features ? 'has-value' : ''} ${validationErrors.features ? 'error' : ''}`}
              value={features}
              onChange={(e) => handleInputChange('features', e.target.value)}
              rows="4"
              required
              maxLength={1000}
            />
            <label htmlFor="key-features" className="floating-label">
              Key Features *
            </label>
            {validationErrors.features && (
              <span className="error-text">{validationErrors.features}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <div className="input-wrapper">
            <select
              id="tone"
              className="form-select"
              value={tone}
              onChange={(e) => handleInputChange('tone', e.target.value)}
            >
              <option value="professional">Professional</option>
              <option value="fun">Fun</option>
              <option value="friendly">Friendly</option>
            </select>
            <label htmlFor="tone" className="floating-label">
              Tone
            </label>
          </div>
        </div>

        <button 
          className={`generate-btn ${loading ? 'loading' : ''}`}
          onClick={generateDescriptions} 
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Generating Descriptions...
            </>
          ) : (
            'Generate Descriptions'
          )}
        </button>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
      </div>
    </section>
  );
}

export default DescriptionForm;