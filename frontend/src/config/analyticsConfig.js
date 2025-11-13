/**
 * Google Analytics Configuration
 * 
 * This file exports the GA4 Measurement ID from environment variables.
 * The Measurement ID should be set in your .env file as:
 * REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 */

export const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

/**
 * Check if GA is enabled (has a valid Measurement ID)
 */
export const isGAEnabled = () => {
  return !!GA_MEASUREMENT_ID && GA_MEASUREMENT_ID.startsWith('G-');
};

/**
 * Get the current page path for tracking
 */
export const getCurrentPagePath = () => {
  return window.location.pathname;
};

