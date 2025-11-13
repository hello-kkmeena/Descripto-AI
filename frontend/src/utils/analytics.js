import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

/**
 * Initialize Google Analytics 4
 * Should be called once when the app loads
 */
export const initGA = () => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    console.log('GA4 initialized with ID:', GA_MEASUREMENT_ID);
  } else {
    console.warn('GA4 Measurement ID not found. Analytics tracking disabled.');
  }
};

/**
 * Track a page view
 * @param {string} path - The path of the page (e.g., '/', '/agent')
 */
export const trackPageView = (path) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

/**
 * Track a custom event
 * @param {string} eventName - Name of the event
 * @param {Object} parameters - Event parameters
 */
export const trackEvent = (eventName, parameters = {}) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.event(eventName, parameters);
  }
};

/**
 * Track a CTA (Call-to-Action) button click
 * @param {string} ctaName - Name of the CTA (e.g., 'get_started', 'generate_description')
 * @param {string} location - Where the CTA is located (e.g., 'header', 'form', 'footer')
 * @param {Object} additionalParams - Additional parameters to include
 */
export const trackCTAClick = (ctaName, location, additionalParams = {}) => {
  trackEvent('cta_click', {
    cta_name: ctaName,
    location: location,
    page: window.location.pathname,
    ...additionalParams
  });
};

/**
 * Track a navigation link click
 * @param {string} linkName - Name of the link (e.g., 'home', 'agent', 'pricing')
 * @param {string} location - Where the link is located (e.g., 'header', 'footer')
 */
export const trackNavigationClick = (linkName, location) => {
  trackEvent('navigation_click', {
    link_name: linkName,
    location: location,
    page: window.location.pathname
  });
};

/**
 * Track a logo click
 * @param {string} location - Where the logo is located (e.g., 'header', 'footer')
 */
export const trackLogoClick = (location) => {
  trackEvent('logo_click', {
    location: location,
    page: window.location.pathname
  });
};

