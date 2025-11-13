import React from "react";
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { trackCTAClick, trackNavigationClick, trackLogoClick } from '../utils/analytics';

function Header({ onOpenAuthModal }) {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const handleGetStarted = () => {
    trackCTAClick('get_started', 'header', {
      user_authenticated: isAuthenticated
    });
    onOpenAuthModal('register');
  };

  const handleSignIn = () => {
    trackCTAClick('sign_in', 'header', {
      user_authenticated: isAuthenticated
    });
    onOpenAuthModal('login');
  };

  const handleLogoClick = () => {
    trackLogoClick('header');
  };

  const handleNavigationClick = (linkName) => {
    trackNavigationClick(linkName, 'header');
  };

  const getDisplayName = () => {
    if (!user) return '';
    return user.firstName || user.email.split('@')[0];
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3" onClick={handleLogoClick}>
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <span className="text-white text-xl font-bold">✨</span>
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Descripto</h1>
              <p className="text-xs text-gray-500 hidden sm:block">AI-Powered Descriptions</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium transition-colors duration-200 ${
                isActive('/') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => handleNavigationClick('home')}
            >
              Home
            </Link>
            <Link 
              to="/agent" 
              className={`font-medium transition-colors duration-200 ${
                isActive('/agent') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => handleNavigationClick('agent')}
            >
              AI Agent
            </Link>
            <a 
              href="#pricing" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
              onClick={() => handleNavigationClick('pricing')}
            >
              Pricing
            </a>
            <a 
              href="#about" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
              onClick={() => handleNavigationClick('about')}
            >
              About
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span>Hi, {getDisplayName()}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSignIn}
                  className="btn-ghost text-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={handleGetStarted}
                  className="btn-primary text-sm py-2 px-4"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header; 