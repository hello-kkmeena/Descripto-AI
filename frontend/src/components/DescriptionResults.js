import React, { useState } from "react";

function DescriptionResults({ descriptions, onGenerateNew, onRegenerate }) {
  const [copiedId, setCopiedId] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleRegenerate = (item) => {
    if (onRegenerate) {
      onRegenerate(item.input, item.id);
    }
  };

  if (!descriptions || descriptions.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">🤖</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                AI Generated Descriptions
              </h2>
              <p className="text-gray-600 text-sm font-medium">
                {descriptions.length} description{descriptions.length > 1 ? 's' : ''} generated
                {descriptions.length >= 20 && (
                  <span className="ml-2 text-warning-600 font-semibold">
                    (Max 20 - oldest removed)
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onGenerateNew}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-500/20"
          >
            <span className="flex items-center space-x-2">
              <span className="text-lg">🔄</span>
              <span>Generate New</span>
            </span>
          </button>
        </div>
      </div>

      {/* Modern Descriptions List */}
      <div className="relative">
        {/* Scroll Indicators */}
        {descriptions.length > 5 && (
          <>
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white via-white/80 to-transparent z-10 pointer-events-none rounded-t-2xl"></div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none rounded-b-2xl"></div>
          </>
        )}
        
        {/* Scrollable Descriptions List */}
        <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          {descriptions.map((item, index) => (
            <div 
              key={item.id || index} 
              className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-soft hover:shadow-medium hover:border-primary-200 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Modern Input Details Header */}
              <div className="mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</span>
                    </div>
                    <p className="text-gray-900 font-medium text-sm">{item.input?.title || 'N/A'}</p>
                  </div>
                  
                  <div className="relative space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Features</span>
                    </div>
                    <div>
                      <p 
                        className="text-gray-700 text-sm line-clamp-1 cursor-help group-hover:text-gray-900 transition-colors"
                        onMouseEnter={() => setHoveredCard(item.id || index)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        {item.input?.features || 'N/A'}
                      </p>
                      <div 
                        className={`absolute top-full left-0 right-0 mt-3 p-4 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl z-20 max-w-md transition-all duration-300 ease-in-out ${
                          hoveredCard === (item.id || index) 
                            ? 'opacity-100 visible transform translate-y-0' 
                            : 'opacity-0 invisible transform -translate-y-2'
                        }`}
                      >
                        <p className="text-gray-800 text-sm leading-relaxed">
                          {item.input?.features || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tone</span>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                        item.input?.tone === 'professional' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        item.input?.tone === 'friendly' ? 'bg-green-100 text-green-800 border border-green-200' :
                        'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {item.input?.tone || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => copyToClipboard(item.description, item.id || index)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        copiedId === (item.id || index) 
                          ? 'bg-success-100 text-success-700 border border-success-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      {copiedId === (item.id || index) ? (
                        <>
                          <span className="text-success-600">✓</span>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <span>📋</span>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleRegenerate(item)}
                      className="flex items-center space-x-2 px-3 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 rounded-lg text-xs font-medium transition-all duration-200"
                    >
                      <span>🔄</span>
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modern AI Response */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200/50">
                <div className="flex items-start space-x-4">
                  {/* Modern AI Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success-500 rounded-full border border-white"></div>
                  </div>
                  
                  {/* Response Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500 font-medium">
                          {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'Just now'}
                        </span>
                        {index === 0 && (
                          <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-sm">
                            Latest
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Description Text */}
                    <div className="max-w-none">
                      <p className="text-gray-800 leading-relaxed text-sm font-medium">
                        {item.description}
                      </p>
                    </div>
                    
                    {/* Modern Footer */}
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">AI Generated</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Usage Instructions */}
      <div className="bg-gradient-to-br from-primary-50 via-primary-100/30 to-primary-50 rounded-2xl p-6 border border-primary-200/50 shadow-soft">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <span className="text-white text-2xl">💡</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            How to Use These Descriptions
          </h3>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            Copy any of the AI-generated descriptions and use them for your product listings
          </p>
          <button
            onClick={() => copyToClipboard(descriptions[0].description, 'all')}
            className={`bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-500/20 ${
              copiedId === 'all' ? 'from-success-500 to-success-600 hover:from-success-600 hover:to-success-700' : ''
            }`}
          >
            {copiedId === 'all' ? (
              <span className="flex items-center space-x-2">
                <span className="text-lg">✓</span>
                <span>Latest Description Copied!</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span className="text-lg">📋</span>
                <span>Copy Latest Description</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Modern AI Suggestions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-soft">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white text-lg">💡</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            AI Agent Suggestions
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Compare different descriptions to choose the best one",
            "Use the latest description for immediate use",
            "Try different tones for various marketing channels",
            "Customize the descriptions to match your brand voice"
          ].map((suggestion, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-gray-700 font-medium">{suggestion}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Generate Another */}
      <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-soft">
        <p className="text-gray-600 mb-4 text-sm font-medium">
          Need more variations or want to try a different tone?
        </p>
        <button
          onClick={onGenerateNew}
          className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-500/20"
        >
          <span className="flex items-center space-x-2">
            <span className="text-lg">🤖</span>
            <span>Generate Another Description</span>
          </span>
        </button>
      </div>
    </div>
  );
}

export default DescriptionResults;
