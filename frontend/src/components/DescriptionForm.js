import React, { useState } from "react";
import axios from "axios";

function DescriptionForm({ onResult }) {
  const [title, setTitle] = useState("");
  const [features, setFeatures] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateDescriptions = async () => {
    if (!title.trim() || !features.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/generate-description`, {
        title,
        features,
        tone,
      });
      if (res.data.descriptions) {
        onResult(res.data.descriptions);
      } else if (res.data.error) {
        setError(res.data.error);
      } else {
        setError("Unexpected server response.");
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <section className="form-section">
      <div className="form-container">
        <h2 className="form-title">Generate AI Product Descriptions</h2>
        <p className="form-subtitle">
          Transform your product details into compelling descriptions that sell
        </p>
        
        <div className="form-group">
          <div className="input-wrapper">
            <input
              type="text"
              id="product-title"
              className={`form-input ${title ? 'has-value' : ''}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <label htmlFor="product-title" className="floating-label">
              Product Title *
            </label>
          </div>
        </div>

        <div className="form-group">
          <div className="input-wrapper">
            <textarea
              id="key-features"
              className={`form-textarea ${features ? 'has-value' : ''}`}
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows="4"
              required
            />
            <label htmlFor="key-features" className="floating-label">
              Key Features *
            </label>
          </div>
        </div>

        <div className="form-group">
          <div className="input-wrapper">
            <select
              id="tone"
              className="form-select"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
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