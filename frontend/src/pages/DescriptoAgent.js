import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/apiService';
import { AUTH_ENDPOINTS } from '../config/apiConfig';

function DescriptoAgent() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputData, setInputData] = useState({
    productName: '',
    features: '',
    tone: 'professional'
  });
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [isRenaming, setIsRenaming] = useState(null);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputErrors, setInputErrors] = useState({});
  const messagesEndRef = useRef(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  // Map to store messages for each tab
  const [tabMessages, setTabMessages] = useState({});
  
  // Debounced input validation
  useEffect(() => {
    const timer = setTimeout(() => {
      const errors = {};
      if (inputData.productName.trim().length > 100) {
        errors.productName = 'Product name must be less than 100 characters';
      }
      if (inputData.features.trim().length > 500) {
        errors.features = 'Features must be less than 500 characters';
      }
      setInputErrors(errors);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputData]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load conversations from localStorage
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    const savedTabMessages = localStorage.getItem('tabMessages');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
    if (savedTabMessages) {
      setTabMessages(JSON.parse(savedTabMessages));
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    if (Object.keys(tabMessages).length > 0) {
      localStorage.setItem('tabMessages', JSON.stringify(tabMessages));
    }
  }, [tabMessages]);

  // Effect to update messages when switching tabs
  useEffect(() => {
    if (activeConversation) {
      setMessages(tabMessages[activeConversation] || []);
    } else {
      setMessages([]);
    }
  }, [activeConversation, tabMessages]);

  const validateInput = () => {
    const errors = {};
    if (!inputData.productName.trim()) {
      errors.productName = 'Product name is required';
    }
    if (!inputData.features.trim()) {
      errors.features = 'Features are required';
    }
    if (inputData.productName.trim().length > 100) {
      errors.productName = 'Product name must be less than 100 characters';
    }
    if (inputData.features.trim().length > 500) {
      errors.features = 'Features must be less than 500 characters';
    }
    setInputErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInput()) return;

    setLoading(true);
    const messageId = Date.now();

    // Create user message
    const userMessage = {
      id: messageId,
      type: 'user',
      content: `Product: ${inputData.productName}\nFeatures: ${inputData.features}\nTone: ${inputData.tone}`,
      timestamp: new Date().toISOString(),
      data: { ...inputData },
      status: 'sending'
    };

    // Optimistically add user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Update tab messages optimistically
    if (activeConversation) {
      setTabMessages(prev => ({
        ...prev,
        [activeConversation]: updatedMessages
      }));
    }

    try {
      const requestData = {
        name: inputData.productName,
        features: inputData.features,
        tone: inputData.tone,
        tabId: activeConversation
      };

      const response = await (isAuthenticated
        ? ApiService.fetchWithAuth(AUTH_ENDPOINTS.AGENT, {
            method: 'POST',
            body: JSON.stringify(requestData)
          })
        : ApiService.fetchWithoutAuth(AUTH_ENDPOINTS.AGENT, {
            method: 'POST',
            body: JSON.stringify(requestData)
          }));

      if (response.success && response.data) {
        const { tabId, tabName, description, queId, type } = response.data;

        // Update user message status
        const updatedUserMessage = { ...userMessage, status: 'sent' };

        // Create AI response message
        const aiMessage = {
          id: queId,
          type: 'ai',
          content: description,
          timestamp: new Date().toISOString(),
          messageType: type,
          status: 'received'
        };

        const newMessages = [updatedUserMessage, aiMessage];

        // Handle tab management
        if (!activeConversation) {
          // New conversation
          const newConversation = {
            id: tabId,
            name: tabName,
            timestamp: new Date(),
            lastMessage: description.substring(0, 50) + '...'
          };

          setConversations(prev => [newConversation, ...prev]);
          setActiveConversation(tabId);
          
          setTabMessages(prev => ({
            ...prev,
            [tabId]: newMessages
          }));

          setMessages(newMessages);
        } else {
          // Existing conversation
          const updatedTabMessages = [
            ...(tabMessages[activeConversation] || []).slice(0, -1),
            updatedUserMessage,
            aiMessage
          ];

          setTabMessages(prev => ({
            ...prev,
            [activeConversation]: updatedTabMessages
          }));

          setMessages(updatedTabMessages);

          // Update conversation preview
          setConversations(prev =>
            prev.map(conv =>
              conv.id === activeConversation
                ? {
                    ...conv,
                    lastMessage: description.substring(0, 50) + '...',
                    timestamp: new Date()
                  }
                : conv
            )
          );
        }

        // Clear input
        setInputData({
          productName: '',
          features: '',
          tone: 'professional'
        });
      }
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Update user message to show error
      const updatedMessages = messages.map(msg =>
        msg.id === messageId
          ? { ...msg, status: 'error' }
          : msg
      );

      setMessages(updatedMessages);
      if (activeConversation) {
        setTabMessages(prev => ({
          ...prev,
          [activeConversation]: updatedMessages
        }));
      }

      // Add error message
      const errorMessage = {
        id: Date.now(),
        type: 'error',
        content: 'Failed to generate response. Click to retry.',
        timestamp: new Date().toISOString(),
        originalRequest: requestData,
        retryable: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (errorMessage) => {
    if (!errorMessage.retryable) return;
    
    // Remove the error message
    setMessages(prev => prev.filter(msg => msg.id !== errorMessage.id));
    
    // Retry the request
    setInputData(errorMessage.originalRequest);
    handleSubmit(new Event('submit'));
  };

  const handleCopyMessage = async (message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleNewConversation = () => {
    setActiveConversation(null);
    setMessages([]);
  };

  const handleDeleteConversation = (id) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    setTabMessages(prev => {
      const newTabMessages = { ...prev };
      delete newTabMessages[id];
      return newTabMessages;
    });
    if (activeConversation === id) {
      setActiveConversation(null);
      setMessages([]);
    }
    setMenuOpen(null);
  };

  const handleRenameSubmit = (id) => {
    if (!newName.trim()) return;
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id ? { ...conv, name: newName.trim() } : conv
      )
    );
    setIsRenaming(null);
    setNewName('');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out z-30`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={handleNewConversation}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              New Description
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`relative group ${
                  activeConversation === conv.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                {isRenaming === conv.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRenameSubmit(conv.id);
                    }}
                    className="p-3"
                  >
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded"
                      autoFocus
                      onBlur={() => handleRenameSubmit(conv.id)}
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setActiveConversation(conv.id)}
                    className="w-full p-3 text-left text-sm"
                  >
                    <span className="block font-medium truncate">{conv.name}</span>
                    <span className="block text-xs text-gray-500">
                      {new Date(conv.timestamp).toLocaleDateString()}
                    </span>
                  </button>
                )}

                {/* Three Dots Menu */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === conv.id ? null : conv.id);
                  }}
                  className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-full"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {menuOpen === conv.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsRenaming(conv.id);
                          setNewName(conv.name);
                          setMenuOpen(null);
                        }}
                        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      >
                        Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conv.id);
                        }}
                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-0'} transition-margin duration-200 ease-in-out`}>
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-40 p-2 bg-white rounded-md shadow-md hover:bg-gray-100"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex flex-col h-screen">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">🤖</span>
                </div>
                <h2 className="text-xl font-semibold mb-2">Welcome to Descripto AI Agent</h2>
                <p className="max-w-md text-sm">
                  I'm here to help you create amazing product descriptions. Start by filling out the form below.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  onClick={() => message.type === 'error' && message.retryable && handleRetry(message)}
                >
                  <div
                    className={`relative max-w-[80%] rounded-lg p-4 group ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.type === 'error'
                        ? 'bg-red-100 text-red-700 cursor-pointer'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Message Status */}
                    {message.type === 'user' && (
                      <div className="absolute bottom-1 right-2 text-xs opacity-75">
                        {message.status === 'sending' && '⏳'}
                        {message.status === 'sent' && '✓'}
                        {message.status === 'error' && '⚠️'}
                      </div>
                    )}

                    {/* Copy Button */}
                    {message.type === 'ai' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyMessage(message);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity duration-200"
                      >
                        {copiedMessageId === message.id ? (
                          <span className="text-green-600 text-xs">Copied! ✓</span>
                        ) : (
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Row: Title and Tone */}
              <div className="flex gap-4">
                <div className="flex-[2]">
                  <input
                    type="text"
                    value={inputData.productName}
                    onChange={(e) => setInputData(prev => ({ ...prev, productName: e.target.value }))}
                    placeholder="Product Name"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      inputErrors.productName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {inputErrors.productName && (
                    <p className="mt-1 text-xs text-red-500">{inputErrors.productName}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {inputData.productName.length}/100 characters
                  </p>
                </div>
                <div className="flex-1">
                  <select
                    value={inputData.tone}
                    onChange={(e) => setInputData(prev => ({ ...prev, tone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="fun">Fun & Casual</option>
                  </select>
                </div>
              </div>

              {/* Second Row: Features and Submit */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={inputData.features}
                    onChange={(e) => setInputData(prev => ({ ...prev, features: e.target.value }))}
                    placeholder="Product Features (e.g., Noise cancellation, 30-hour battery, Premium sound)"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      inputErrors.features ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {inputErrors.features && (
                    <p className="mt-1 text-xs text-red-500">{inputErrors.features}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {inputData.features.length}/500 characters
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={!inputData.productName.trim() || !inputData.features.trim() || loading || Object.keys(inputErrors).length > 0}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
                >
                  {loading ? 'Generating...' : 'Generate'}
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