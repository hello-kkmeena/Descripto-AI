import React, { useState } from "react";

function DescriptionResults({ descriptions, onRegenerate, onDelete, descriptionMetadata = [] }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const getCharacterCount = (text) => {
    return text.length;
  };

  const getSeoScore = (text) => {
    return "--";
  };

  if (!descriptions.length) return null;

  return (
    <section className="results-section">
      <div className="results-container">
        <div className="results-grid">
          {descriptions.map((description, index) => {
            const metadata = descriptionMetadata[index];
            const descriptionId = metadata ? metadata.id : index;
            const descriptionType = metadata ? metadata.type : 'fresh';
            
            return (
              <div key={descriptionId} className="result-card">
                <div className="card-header">
                  <div className="card-info">
                    <span className="card-number">#{descriptionId}</span>
                    <span className={`card-type ${descriptionType}`}>{descriptionType}</span>
                    <span className="character-count">
                      {getCharacterCount(description)} chars
                    </span>
                    <span className="seo-score">
                      SEO: {getSeoScore(description)}%
                    </span>
                  </div>
                  <div className="card-details-header">
                    <div className="detail-item-header">
                      <span className="detail-label-header">Title:</span>
                      <span className="detail-value-header">{metadata ? metadata.title : 'N/A'}</span>
                    </div>
                    <div className="detail-item-header">
                      <span className="detail-label-header">Features:</span>
                      <span className="detail-value-header">{metadata ? metadata.features : 'N/A'}</span>
                    </div>
                    <div className="detail-item-header">
                      <span className="detail-label-header">Tone:</span>
                      <span className="detail-value-header">{metadata ? metadata.tone : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="card-actions">
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
                    {onDelete && (
                      <button
                        className="delete-btn"
                        onClick={() => onDelete(descriptionId)}
                        title="Delete this description"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
                <div className="card-content">
                  <p className="description-text">{description}</p>
                </div>
                <div className="card-footer">
                  <button
                    className="regenerate-single-btn"
                    onClick={() => onRegenerate && onRegenerate(descriptionId)}
                    title="Regenerate this description"
                  >
                    🔄 Regenerate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default DescriptionResults;
