import ApiService from './apiService';
import { GENERATE_ENDPOINTS } from '../config/apiConfig';

export const generateChatResponse = async (isAuthenticated, requestData) => {
  const { tabId, messageId, title, features, tone } = requestData;

  const chatRequest = {
    tabid: tabId || null,
    userChatInput: {
      messageId: messageId || undefined,
      title: title,
      tone: {
        id: 1, // Default tone ID
        name: tone
      },
      feature: features
    }
  };

  return await (isAuthenticated
    ? ApiService.fetchWithAuth(GENERATE_ENDPOINTS.CHAT, {
        method: 'POST',
        body: JSON.stringify(chatRequest)
      })
    : ApiService.fetchWithoutAuth(GENERATE_ENDPOINTS.CHAT, {
        method: 'POST',
        body: JSON.stringify(chatRequest)
      }));
};

export default {
  generateChatResponse
};