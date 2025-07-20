import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import SuccessNotification from './components/auth/SuccessNotification';
import Header from './components/Header';
import Footer from './components/Footer';
import DescriptionForm from './components/DescriptionForm';
import DescriptionResults from './components/DescriptionResults';
import { getEndpointUrl } from './config/api';
import './index.css';

function AppContent() {
  const { checkAuthStatus } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [descriptions, setDescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('');

  // Check authentication status on app start
  useEffect(() => {
    console.log('App mounted, checking auth status...');
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleAuthSuccess = (userData) => {
    setIsAuthModalOpen(false);
    setSuccessMessage(`Welcome, ${userData.user.first_name || userData.user.name}! You've been successfully signed in.`);
    setShowSuccessNotification(true);
    
    // Hide success notification after 3 seconds
    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 3000);
  };

  const handleGenerateDescription = (generatedDescription, inputData) => {
    const newDescription = {
      id: Date.now(),
      description: generatedDescription,
      input: inputData,
      timestamp: new Date().toISOString()
    };
    
    // Add to the beginning of the list (latest on top) and limit to 20 items
    setDescriptions(prev => {
      const updatedList = [newDescription, ...prev];
      // Remove oldest items if we exceed 20
      return updatedList.slice(0, 20);
    });
  };

  const handleRegenerateDescription = async (inputData, cardId) => {
    setLoading(true);
    
    try {
      const response = await fetch(getEndpointUrl('GENERATE_DESCRIPTION'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to regenerate description');
      }
      
      const data = await response.json();
      
      if (data.descriptions && data.descriptions.length > 0) {
        // Update the existing card instead of creating a new one
        setDescriptions(prev => 
          prev.map(desc => 
            desc.id === cardId 
              ? {
                  ...desc,
                  description: data.descriptions[0],
                  timestamp: new Date().toISOString()
                }
              : desc
          )
        );
      }
    } catch (error) {
      console.error('Error regenerating description:', error);
      // You might want to show an error notification here
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

  const handleGenerateNew = () => {
    // Keep the existing descriptions, just allow generating a new one
    // The form will be cleared when the user starts typing
  };

  return (
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
              descriptions.length > 0 ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-4xl mx-auto'
            }`}>
              {/* Form Section */}
              <div className={`transition-all duration-500 ${descriptions.length > 0 ? 'lg:sticky lg:top-8' : ''}`}>
                <DescriptionForm 
                  onResult={handleGenerateDescription}
                  loading={loading}
                  setLoading={setLoading}
                />
              </div>
              
              {/* Results Section */}
              {descriptions.length > 0 && (
                <div className="animate-slide-up">
                  <DescriptionResults 
                    descriptions={descriptions}
                    onGenerateNew={handleGenerateNew}
                    onRegenerate={handleRegenerateDescription}
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
    );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
