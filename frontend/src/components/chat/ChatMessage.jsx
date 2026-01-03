import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ChatMessage = ({ message }) => {
  const { user } = useAuth();
  const isOwnMessage = message.sender === user.id;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'professor':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`mb-2 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
      <div className={`inline-block max-w-[80%] ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
        {!isOwnMessage && (
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-xs font-semibold text-gray-700">
              {message.senderName}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${getRoleBadgeColor(
                message.senderRole
              )}`}
            >
              {message.senderRole}
            </span>
          </div>
        )}
        <div
          className={`px-3 py-1.5 rounded-lg text-sm ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          <p className="break-words whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={`text-[10px] text-gray-500 mt-0.5 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
