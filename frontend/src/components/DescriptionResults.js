import React, { useState } from "react";

function DescriptionResults({ descriptions }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!descriptions.length) return null;

  return (
    <section className="results-section">
      <div className="results-container">
        <h2 className="results-title">Generated Descriptions</h2>
        <p className="results-subtitle">
          Choose the description that best fits your product
        </p>
        
        <div className="results-grid">
          {descriptions.map((description, index) => (
            <div key={index} className="result-card">
              <div className="card-header">
                <span className="card-number">#{index + 1}</span>
                <button
                  className={`copy-btn ${copiedIndex === index ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(description, index)}
                  title="Copy to clipboard"
                >
                  {copiedIndex === index ? (
                    <>
                      <span className="copy-icon">✓</span>
                      Copied!
                    </>
                  ) : (
                    <>
                      <span className="copy-icon">📋</span>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="card-content">
                <p className="description-text">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DescriptionResults;
