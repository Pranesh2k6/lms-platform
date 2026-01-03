import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ChatMessage from './ChatMessage';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ChatWindow = ({ room }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages when room changes
  useEffect(() => {
    if (!room) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/chat/${room.id}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Join the room via Socket.io
    if (socket) {
      socket.emit('join_room', {
        room: room.id,
        userId: user.id,
        userName: user.name,
        userRole: user.role
      });
    }

    // Cleanup: leave room when component unmounts or room changes
    return () => {
      if (socket && room) {
        socket.emit('leave_room', {
          room: room.id,
          userName: user.name
        });
      }
    };
  }, [room, socket, user]);

  // Socket.io event listeners
  useEffect(() => {
    if (!socket) return;

    // Receive new messages
    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    // User joined/left notifications
    const handleUserJoined = (data) => {
      console.log(data.message);
    };

    const handleUserLeft = (data) => {
      console.log(data.message);
    };

    // Typing indicators
    const handleUserTyping = (data) => {
      setTyping(data.userName);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(null);
      }, 3000);
    };

    const handleUserStopTyping = () => {
      setTyping(null);
    };

    // Error handling
    const handleError = (error) => {
      toast.error(error.message || 'An error occurred');
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('error', handleError);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('error', handleError);
    };
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !socket) return;

    const messageData = {
      room: room.id,
      sender: user.id,
      senderName: user.name,
      senderRole: user.role,
      content: newMessage.trim()
    };

    socket.emit('send_message', messageData);
    socket.emit('stop_typing', { room: room.id, userName: user.name });

    setNewMessage('');
  };

  const handleTyping = () => {
    if (!socket) return;

    socket.emit('typing', { room: room.id, userName: user.name });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { room: room.id, userName: user.name });
    }, 1000);
  };

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="text-6xl">💬</span>
          <h3 className="mt-4 text-lg font-semibold text-gray-700">
            Select a chat room to start messaging
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Choose a room from the sidebar to begin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          {room.type === 'staff' ? (
            <span className="text-2xl">👥</span>
          ) : (
            <span className="text-2xl">📚</span>
          )}
          <div>
            <h2 className="text-lg font-bold text-gray-800">{room.name}</h2>
            {room.type === 'staff' && (
              <p className="text-sm text-gray-500">{room.description}</p>
            )}
            {room.type === 'course' && (
              <p className="text-sm text-gray-500">Course: {room.courseCode}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Be the first to send a message!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Typing indicator */}
        {typing && (
          <div className="text-sm text-gray-500 italic">
            {typing} is typing...
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
