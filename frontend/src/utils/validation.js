// Form field limits
export const FORM_LIMITS = {
  PRODUCT_NAME_MAX_LENGTH: 100,
  FEATURES_MAX_LENGTH: 500
};

// Form validation functions
export const validateProductName = (value) => {
  if (value.length > FORM_LIMITS.PRODUCT_NAME_MAX_LENGTH) {
    return `Product name must be less than ${FORM_LIMITS.PRODUCT_NAME_MAX_LENGTH} characters`;
  }
  return '';
};

export const validateFeatures = (value) => {
  if (value.length > FORM_LIMITS.FEATURES_MAX_LENGTH) {
    return `Features must be less than ${FORM_LIMITS.FEATURES_MAX_LENGTH} characters`;
  }
  return '';
};

// Form initial states
export const INITIAL_FORM_STATE = {
  values: {
    productName: '',
    features: '',
    tone: 'professional'
  },
  errors: {
    productName: '',
    features: ''
  }
};

// Tone options
export const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'fun', label: 'Fun & Casual' }
];