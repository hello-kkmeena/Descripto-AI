import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/form/FormInput';
import Sidebar from '../components/Sidebar';
import LoadingOverlay from '../components/LoadingOverlay';
import ChatMessages from '../components/chat/ChatMessages';
import { fetchUserTabs, fetchTabChats } from '../services/tabService';
import ApiService from '../services/apiService';
import { GENERATE_ENDPOINTS } from '../config/apiConfig';
import {
  INITIAL_FORM_STATE,
  TONE_OPTIONS,
  validateProductName,
  validateFeatures,
  FORM_LIMITS
} from '../utils/validation';

const ToggleSidebarButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed top-4 left-4 z-40 p-2 bg-white rounded-md shadow-md hover:bg-gray-100"
  >
    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>
);

const WelcomeMessage = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
      <span className="text-3xl">🤖</span>
    </div>
    <h2 className="text-xl font-semibold mb-2">Welcome to Descripto AI Agent</h2>
    <p className="max-w-md text-sm">
      I'm here to help you create amazing product descriptions. Start by filling out the form below.
    </p>
  </div>
);

function DescriptoAgent() {
  const location = useLocation();
  const initialInput = location.state && location.state.initialInput ? location.state.initialInput : null;
  const hasProcessedInitialInput = useRef(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTabId, setSelectedTabId] = useState(null);
  const [tabChats, setTabChats] = useState({});
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatError, setChatError] = useState(null);

  // Load chat messages for a tab
  const loadTabChats = async (tabId) => {
    // Return cached chats if available
    if (tabChats[tabId]) {
      return;
    }

    try {
      setIsLoadingChats(true);
      setChatError(null);
      const messages = await fetchTabChats(isAuthenticated, tabId);
      setTabChats(prev => ({
        ...prev,
        [tabId]: messages
      }));
    } catch (err) {
      setChatError('Failed to load chat messages');
      console.error('Error loading chat messages:', err);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Handle tab selection
  const handleTabSelect = (tabId) => {
    setSelectedTabId(tabId);
  };

  const handleNewDescription = () => {
    setSelectedTabId(null); // Clear selected tab for new description
    setFormState(INITIAL_FORM_STATE); // Reset form
  };

  // Load messages when selected tab changes
  useEffect(() => {
    if (selectedTabId) {
      loadTabChats(selectedTabId);
    }
  }, [selectedTabId]);

  // Fetch tabs helper (optionally preserve current selection)
  const loadTabs = async (preserveSelection = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const tabs = await fetchUserTabs(isAuthenticated);
      setConversations(tabs);
      // Select first tab by default only if we are not preserving current selection
      if (!preserveSelection && (!selectedTabId) && tabs && tabs.length > 0) {
        setSelectedTabId(tabs[0].id);
      }
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Error loading tabs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialInput && !hasProcessedInitialInput.current) {
      return;
    }
    loadTabs(false);
  }, [isAuthenticated]);

  // If navigated with initial input from DescriptionForm, seed state and generate first response before loading tabs
  useEffect(() => {
    const generateFromInitialInput = async () => {
      try {
        // Seed form values and force a new tab creation flow
        setSelectedTabId(null);
        setFormState(prev => ({
          values: {
            ...prev.values,
            productName: initialInput.productName,
            features: initialInput.features,
            tone: initialInput.tone,
            charCount: initialInput.charCount
          },
          errors: { ...prev.errors }
        }));

        setIsGenerating(true);
        setChatError(null);

        if (isAuthenticated) {
          // Authenticated: use chat endpoint with tab creation
          const requestData = {
            tabid: null,
            userChatInput: {
              messageId: Date.now().toString(),
              title: initialInput.productName,
              tone: { id: 0, name: initialInput.tone },
              feature: initialInput.features,
              charCount: initialInput.charCount
            }
          };

          const response = await ApiService.fetchWithAuth(GENERATE_ENDPOINTS.CHAT, {
            method: 'POST',
            body: JSON.stringify(requestData)
          });

          if (response.success && response.data) {
            const newMessage = {
              userChatInput: requestData.userChatInput,
              response: response.data.response
            };

            const newTabId = response.data.tabId;
            if (newTabId) {
              setSelectedTabId(newTabId);
            }
            if (newTabId) {
              setTabChats(prev => ({
                ...prev,
                [newTabId]: [...(prev[newTabId] || []), newMessage]
              }));
            }

            // Refresh tabs from server, preserving selected tab
            await loadTabs(true);

            setFormState(prevState => ({
              values: {
                ...INITIAL_FORM_STATE.values,
                tone: prevState.values.tone
              },
              errors: INITIAL_FORM_STATE.errors
            }));
          }
        } else {
          // Unauthenticated: use description endpoint, create local pseudo tab
          const descriptionRequest = {
            productName: initialInput.productName,
            productFeature: initialInput.features,
            tone: { id: null, name: initialInput.tone },
            charCount: initialInput.charCount
          };

          const response = await ApiService.fetchWithoutAuth(GENERATE_ENDPOINTS.DESCRIPTION, {
            method: 'POST',
            body: JSON.stringify(descriptionRequest)
          });

          if (response.success && response.data) {
            const pseudoTabId = Date.now();
            const pseudoTabName = `${initialInput.productName}_${initialInput.tone}`;

            // Select and add local tab
            setSelectedTabId(pseudoTabId);
            setConversations(prev => ([
              {
                id: pseudoTabId,
                name: pseudoTabName,
                timestamp: new Date(),
                isActive: true
              },
              ...prev
            ]));

            const newMessage = {
              userChatInput: {
                messageId: descriptionRequest.productName + '_' + pseudoTabId,
                title: descriptionRequest.productName,
                tone: descriptionRequest.tone,
                feature: descriptionRequest.productFeature,
                charCount: descriptionRequest.charCount
              },
              response: response.data.content
            };

            setTabChats(prev => ({
              ...prev,
              [pseudoTabId]: [...(prev[pseudoTabId] || []), newMessage]
            }));

            // No server tabs to load for unauthenticated users

            setFormState(prevState => ({
              values: {
                ...INITIAL_FORM_STATE.values,
                tone: prevState.values.tone
              },
              errors: INITIAL_FORM_STATE.errors
            }));
          }
        }
      } catch (err) {
        setChatError('Failed to generate response. Please try again.');
        console.error('Error generating from initial input:', err);
      } finally {
        setIsGenerating(false);
        hasProcessedInitialInput.current = true;
      }
    };

    if (initialInput && !hasProcessedInitialInput.current) {
      generateFromInitialInput();
    }
  }, [initialInput, isAuthenticated]);

  const handleDeleteTab = (tabId) => {
    setConversations(prev => {
      const newConversations = prev.filter(conv => conv.id !== tabId);
      // If we're deleting the selected tab, select the first available tab
      if (tabId === selectedTabId && newConversations.length > 0) {
        setSelectedTabId(newConversations[0].id);
      } else if (newConversations.length === 0) {
        setSelectedTabId(null);
      }
      return newConversations;
    });
  };

  const handleInputChange = (field, value) => {
    let error = '';
    
    // Validate field
    switch (field) {
      case 'productName':
        error = validateProductName(value);
        break;
      case 'features':
        error = validateFeatures(value);
        break;
      default:
        break;
    }

    // Update form state
    setFormState(prev => ({
      values: {
        ...prev.values,
        [field]: value
      },
      errors: {
        ...prev.errors,
        [field]: error
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for errors
    if (Object.values(formState.errors).some(error => error !== '')) {
      return;
    }

    try {
      setIsGenerating(true);
      setChatError(null);

      if(isAuthenticated) {
        const requestData = {
          tabid: selectedTabId || null,
          userChatInput: {
            messageId: Date.now().toString(), // Generate unique message ID
            title: formState.values.productName,
            tone: {
              id: 0, // Default to 0 as per API
              name: formState.values.tone
            },
            feature: formState.values.features,
            charCount: formState.values.charCount
          }
        };

        const response = await ApiService.fetchWithAuth(GENERATE_ENDPOINTS.CHAT, {
          method: 'POST',
          body: JSON.stringify(requestData)
        });

        if (response.success && response.data) {
          const newMessage = {
            userChatInput: requestData.userChatInput,
            response: response.data.response
          };

          if (!selectedTabId && response.data.tabId) {
            setSelectedTabId(response.data.tabId);
            setConversations(prev => [{
              id: response.data.tabId,
              name: `Chat ${prev.length + 1}`,
              timestamp: new Date(),
              isActive: true
            }, ...prev]);
          }

          const tabId = selectedTabId || response.data.tabId;
          setTabChats(prev => ({
            ...prev,
            [tabId]: [...(prev[tabId] || []), newMessage]
          }));
        }
      } else {
        // Unauthenticated flow: call description endpoint and manage pseudo tabs locally
        const descriptionRequest = {
          productName: formState.values.productName,
          productFeature: formState.values.features,
          tone: { id: null, name: formState.values.tone },
          charCount: formState.values.charCount
        };

        const response = await ApiService.fetchWithoutAuth(GENERATE_ENDPOINTS.DESCRIPTION, {
          method: 'POST',
          body: JSON.stringify(descriptionRequest)
        });

        if (response.success && response.data) {
          // Ensure there is a pseudo tab to attach messages to
          let targetTabId = selectedTabId;
          if (!targetTabId) {
            targetTabId = Date.now();
            const pseudoTabName = `${formState.values.productName}_${formState.values.tone}`;
            setSelectedTabId(targetTabId);
            setConversations(prev => ([
              {
                id: targetTabId,
                name: pseudoTabName,
                timestamp: new Date(),
                isActive: true
              },
              ...prev
            ]));
          }

          const newMessage = {
            userChatInput: {
              messageId: Date.now().toString(),
              title: descriptionRequest.productName,
              tone: descriptionRequest.tone,
              feature: descriptionRequest.productFeature,
              charCount: descriptionRequest.charCount
            },
            response: response.data.content
          };

          setTabChats(prev => ({
            ...prev,
            [targetTabId]: [...(prev[targetTabId] || []), newMessage]
          }));
        }
      }

      // Clear form inputs while keeping the same tone
      setFormState(prevState => ({
        values: {
          ...INITIAL_FORM_STATE.values,
          tone: prevState.values.tone // Keep the selected tone
        },
        errors: INITIAL_FORM_STATE.errors
      }));
    } catch (err) {
      setChatError('Failed to generate response. Please try again.');
      console.error('Error generating response:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasErrors = Object.values(formState.errors).some(error => error !== '');

  // Note: Previously showed an AuthRequired screen for unauthenticated users.
  // Requirement changed: proceed without blocking UI for unauthenticated state.

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {isGenerating && <LoadingOverlay />}
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        conversations={conversations}
        onDelete={handleDeleteTab}
        isAuthenticated={isAuthenticated}
        selectedTabId={selectedTabId}
        onSelectTab={handleTabSelect}
        onNewDescription={handleNewDescription}
      />
      
      {/* Error States */}
      {(error || chatError) && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || chatError}</p>
        </div>
      )}
      
      {/* Loading State for Chats */}
      {isLoadingChats && (
        <div className="fixed bottom-4 left-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p>Loading chat messages...</p>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-0'} transition-margin duration-200 ease-in-out`}>
        <ToggleSidebarButton onClick={() => setSidebarOpen(!isSidebarOpen)} />

        <div className="flex flex-col h-screen">
          {/* Messages Area */}

          {false && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <WelcomeMessage />
            </div>
          )}

                      <ChatMessages 
              messages={selectedTabId ? tabChats[selectedTabId] : []} 
              isLoading={isLoadingChats}
              isGenerating={isGenerating}
            />

          {/* Input Form */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Row: Title and Tone */}
              <div className="flex flex-wrap gap-4">
                <FormInput
                  value={formState.values.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  placeholder="Product Name"
                  maxLength={FORM_LIMITS.PRODUCT_NAME_MAX_LENGTH}
                  error={formState.errors.productName}
                  className="flex-[2]"
                />
                
                <div className="flex-1 min-w-[150px]">
                  <select
                    value={formState.values.tone}
                    onChange={(e) => handleInputChange('tone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    {TONE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-[150px]">
                  <input
                    type="number"
                    value={formState.values.charCount}
                    onChange={(e) => handleInputChange('charCount', Math.max(50, Math.min(1000, parseInt(e.target.value) || 300)))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    min="50"
                    max="1000"
                    placeholder="Char Count"
                  />
                </div>
              </div>

              {/* Second Row: Features and Submit */}
              <div className="flex gap-4">
                <FormInput
                  value={formState.values.features}
                  onChange={(e) => handleInputChange('features', e.target.value)}
                  placeholder="Product Features (e.g., Noise cancellation, 30-hour battery, Premium sound)"
                  maxLength={FORM_LIMITS.FEATURES_MAX_LENGTH}
                  error={formState.errors.features}
                />
                
                <button
                  type="submit"
                  disabled={hasErrors || isGenerating}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap flex items-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DescriptoAgent;