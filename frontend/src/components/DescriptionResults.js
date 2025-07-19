import React, { useState } from "react";

function DescriptionResults({ results, onGenerateNew }) {
  const [copiedSection, setCopiedSection] = useState(null);

  const copyToClipboard = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  if (!results) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your AI-Generated Content
          </h2>
          <p className="text-gray-600">
            Ready to use product descriptions and marketing content
          </p>
        </div>
        <button
          onClick={onGenerateNew}
          className="btn-secondary"
        >
          <span className="flex items-center space-x-2">
            <span>🔄</span>
            <span>Generate New</span>
          </span>
        </button>
      </div>

      {/* Main Description */}
      <div className="card card-hover">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>📝</span>
            <span>Product Description</span>
          </h3>
          <button
            onClick={() => copyToClipboard(results.description, 'description')}
            className={`btn-ghost text-sm ${
              copiedSection === 'description' ? 'text-success-600' : ''
            }`}
          >
            {copiedSection === 'description' ? (
              <span className="flex items-center space-x-1">
                <span>✓</span>
                <span>Copied!</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <span>📋</span>
                <span>Copy</span>
              </span>
            )}
          </button>
        </div>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed text-lg">
            {results.description}
          </p>
        </div>
      </div>

      {/* Features and Benefits Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Features */}
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <span>⭐</span>
              <span>Key Features</span>
            </h3>
            <button
              onClick={() => copyToClipboard(results.features.join('\n• '), 'features')}
              className={`btn-ghost text-sm ${
                copiedSection === 'features' ? 'text-success-600' : ''
              }`}
            >
              {copiedSection === 'features' ? (
                <span className="flex items-center space-x-1">
                  <span>✓</span>
                  <span>Copied!</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1">
                  <span>📋</span>
                  <span>Copy</span>
                </span>
              )}
            </button>
          </div>
          <ul className="space-y-3">
            {results.features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits */}
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <span>🎯</span>
              <span>Customer Benefits</span>
            </h3>
            <button
              onClick={() => copyToClipboard(results.benefits.join('\n• '), 'benefits')}
              className={`btn-ghost text-sm ${
                copiedSection === 'benefits' ? 'text-success-600' : ''
              }`}
            >
              {copiedSection === 'benefits' ? (
                <span className="flex items-center space-x-1">
                  <span>✓</span>
                  <span>Copied!</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1">
                  <span>📋</span>
                  <span>Copy</span>
                </span>
              )}
            </button>
          </div>
          <ul className="space-y-3">
            {results.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-success-500 rounded-full mt-2"></div>
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copy All Content */}
      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Copy All Content
          </h3>
          <p className="text-gray-600 mb-4">
            Get the complete product description with features and benefits in one click
          </p>
          <button
            onClick={() => {
              const allContent = `PRODUCT DESCRIPTION:\n\n${results.description}\n\nKEY FEATURES:\n${results.features.map(f => `• ${f}`).join('\n')}\n\nCUSTOMER BENEFITS:\n${results.benefits.map(b => `• ${b}`).join('\n')}`;
              copyToClipboard(allContent, 'all');
            }}
            className={`btn-primary ${
              copiedSection === 'all' ? 'bg-success-600 hover:bg-success-700' : ''
            }`}
          >
            {copiedSection === 'all' ? (
              <span className="flex items-center space-x-2">
                <span>✓</span>
                <span>All Content Copied!</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>📋</span>
                <span>Copy All Content</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="card bg-gray-50 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <span>💡</span>
          <span>Usage Tips</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <span className="text-primary-500 font-bold">•</span>
            <span>Use the main description for your product page</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-primary-500 font-bold">•</span>
            <span>Add features to your product specifications</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-primary-500 font-bold">•</span>
            <span>Include benefits in your marketing materials</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-primary-500 font-bold">•</span>
            <span>Customize the content to match your brand voice</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DescriptionResults;
