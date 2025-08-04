import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const UserMessage = ({ title, feature, tone }) => (
  <div className="flex justify-end mb-4">
    <div className="bg-blue-500 text-white rounded-lg p-4 max-w-[80%] shadow">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">Product Name</span>
          <span className="text-xs bg-blue-600 px-2 py-1 rounded">
            {tone.name}
          </span>
        </div>
        <p className="text-sm">{title}</p>
        <div className="border-t border-blue-400 my-2" />
        <div>
          <span className="font-medium">Features</span>
          <p className="text-sm">{feature}</p>
        </div>
      </div>
    </div>
  </div>
);

const AIMessage = ({ response }) => (
  <div className="flex justify-start mb-4">
    <div className="bg-white text-gray-800 rounded-lg p-4 max-w-[80%] shadow space-y-2">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-sm">🤖</span>
        </div>
        <span className="font-medium text-sm text-gray-600">AI Assistant</span>
      </div>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
      </div>
    </div>
  </div>
);

const ChatMessage = ({ message }) => {
  if (!message) return null;

  return message.userChatInput ? (
    <>
      <UserMessage {...message.userChatInput} />
      {message.response && <AIMessage response={message.response} />}
    </>
  ) : null;
};

export default ChatMessage;