import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import SuccessNotification from './components/auth/SuccessNotification';
import Header from './components/Header';
import Footer from './components/Footer';
import DescriptionForm from './components/DescriptionForm';
import DescriptionResults from './components/DescriptionResults';
import './index.css';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [description, setDescription] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('');

  const handleAuthSuccess = (userData) => {
    setIsAuthModalOpen(false);
    setSuccessMessage(`Welcome, ${userData.user.first_name || userData.user.name}! You've been successfully signed in.`);
    setShowSuccessNotification(true);
    
    // Hide success notification after 3 seconds
    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 3000);
  };

  const handleGenerateDescription = async (productInfo) => {
    setLoading(true);
    setResults(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response
      const mockResults = {
        description: `Experience the exceptional ${productInfo.name}, a premium product designed to deliver outstanding performance and reliability. Crafted with precision and attention to detail, this ${productInfo.category} offers superior quality that exceeds expectations. Perfect for ${productInfo.targetAudience}, it combines innovative technology with elegant design to provide an unmatched user experience. Whether you're looking for ${productInfo.keyFeatures.join(' or ')}, this product delivers on all fronts. Invest in excellence and discover why ${productInfo.name} is the preferred choice for discerning customers who demand the best.`,
        features: [
          `Premium ${productInfo.category} design`,
          `Advanced ${productInfo.keyFeatures[0]} technology`,
          `Reliable performance and durability`,
          `User-friendly interface and controls`,
          `Comprehensive warranty and support`
        ],
        benefits: [
          `Enhanced productivity and efficiency`,
          `Long-lasting reliability and performance`,
          `Professional-grade quality and craftsmanship`,
          `Excellent value for investment`,
          `Outstanding customer satisfaction`
        ]
      };
      
      setResults(mockResults);
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setLoading(false);
    }
  };

  const onAuthModelOpen = (mode) => {
    setMode(mode);
    setIsAuthModalOpen(true);
  };

  const onAuthModelClose = () => {
    setIsAuthModalOpen(false);
    setMode('');
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex flex-col">
        <Header onOpenAuthModal={(mode) => onAuthModelOpen(mode)} />
        
        <main className="flex-1 relative">
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-primary-100/30"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl"></div>
              <div className="absolute top-40 right-10 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-primary-100/30 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
              <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  <span className="text-gradient">Product</span> Descripto
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                  Transform your products with AI-powered descriptions that captivate customers and drive sales
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">AI-Powered</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Lightning Fast</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-2 h-2 bg-warning-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">SEO Optimized</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className={`grid gap-8 lg:gap-12 transition-all duration-500 ${
              results ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-4xl mx-auto'
            }`}>
              {/* Form Section */}
              <div className={`transition-all duration-500 ${results ? 'lg:sticky lg:top-8' : ''}`}>
                <DescriptionForm 
                  onResult={handleGenerateDescription}
                  loading={loading}
                />
              </div>
              
              {/* Results Section */}
              {results && (
                <div className="animate-slide-up">
                  <DescriptionResults 
                    results={results}
                    onGenerateNew={() => {
                      setResults(null);
                      setDescription('');
                    }}
                  />
                </div>
              )}
            </div>
          </section>
        </main>
        
        <Footer />
        
        <AuthModal 
          initialMode={mode}
          isOpen={isAuthModalOpen}
          onClose={onAuthModelClose}
          onAuthSuccess={handleAuthSuccess}
        />
        
        <SuccessNotification 
          isVisible={showSuccessNotification}
          message={successMessage}
          onClose={() => setShowSuccessNotification(false)}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
