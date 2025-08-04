import React, { useState } from 'react';
import { deleteTab } from '../services/tabService';

const ConversationItem = ({ 
  conversation, 
  onDelete, 
  isAuthenticated, 
  isSelected,
  onSelect 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteTab(isAuthenticated, conversation.id);
      onDelete(conversation.id);
    } catch (error) {
      console.error('Failed to delete tab:', error);
      // You might want to show an error toast here
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  return (
    <div 
      className={`relative group transition-colors duration-200 ${
        isSelected 
          ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500' 
          : 'hover:bg-gray-50'
      }`}
    >
      <button 
        onClick={() => onSelect(conversation.id)}
        className="w-full p-3 text-left text-sm"
      >
        <span className={`block font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
          {conversation.name}
        </span>
        <span className={`block text-xs ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
          {new Date(conversation.timestamp).toLocaleDateString()}
        </span>
      </button>

      {/* Three Dots Menu Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className={`absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 hover:bg-${isSelected ? 'blue' : 'gray'}-200 rounded-full transition-opacity duration-200`}
      >
        <svg className={`w-4 h-4 ${isSelected ? 'text-blue-500' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left flex items-center space-x-2"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ 
  isOpen, 
  conversations = [], 
  onDelete, 
  isAuthenticated,
  selectedTabId,
  onSelectTab
}) => {
  return (
    <div 
      className={`fixed inset-y-0 left-0 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out z-30`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <button 
            onClick={() => onSelectTab(null)}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            New Description
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <ConversationItem 
              key={conv.id} 
              conversation={conv} 
              onDelete={onDelete}
              isAuthenticated={isAuthenticated}
              isSelected={selectedTabId === conv.id}
              onSelect={onSelectTab}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;