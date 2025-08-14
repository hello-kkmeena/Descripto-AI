import ApiService from './apiService';
import { GENERATE_ENDPOINTS } from '../config/apiConfig';

// Get all tabs for the user
export const fetchUserTabs = async (isAuthenticated, options = {}) => {
  if (!isAuthenticated) {
    return [];
  }

  try {
    const response = await ApiService.fetchWithAuth(`${GENERATE_ENDPOINTS.CHAT}/tabs`, {
      method: 'GET',
      requestKey: options.requestKey || 'tabs:list',
      cancelPrevious: options.cancelPrevious ?? true,
      timeoutMs: options.timeoutMs
    });

    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch tabs');
  } catch (error) {
    console.error('Error fetching tabs:', error);
    throw error;
  }
};

// Delete a specific tab
export const deleteTab = async (isAuthenticated, tabId) => {
  if (!isAuthenticated) {
    throw new Error('Authentication required to delete tabs');
  }

  try {
    const response = await ApiService.fetchWithAuth(`${GENERATE_ENDPOINTS.CHAT}/tabs/${tabId}`, {
      method: 'DELETE'
    });

    if (response.success) {
      return true;
    }
    throw new Error(response.message || 'Failed to delete tab');
  } catch (error) {
    console.error('Error deleting tab:', error);
    throw error;
  }
};

// Get chat messages for a specific tab (requires authentication)
export const fetchTabChats = async (isAuthenticated, tabId, options = {}) => {
  if (!isAuthenticated) {
    return [];
  }

  try {
    const response = await ApiService.fetchWithAuth(`${GENERATE_ENDPOINTS.CHAT}/messages/${tabId}`, {
      method: 'GET',
      requestKey: options.requestKey || `tabChats:${tabId}`,
      cancelPrevious: options.cancelPrevious ?? true,
      timeoutMs: options.timeoutMs
    });

    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch tab messages');
  } catch (error) {
    console.error('Error fetching tab messages:', error);
    throw error;
  }
};

export default {
  fetchUserTabs,
  deleteTab,
  fetchTabChats
};