import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Users, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ChatMessage from './ChatMessage';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ChatPopup = ({ onClose }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  console.log('ChatPopup rendering, user:', user, 'socket:', socket);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        console.log('Fetching rooms...');
        setLoading(true);
        setError(null);
        const response = await api.get('/chat/rooms');
        console.log('Fetched rooms:', response.data);
        setRooms(response.data);

        // Auto-select first room if available
        if (response.data.length > 0) {
          setActiveRoom(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('Failed to load chat rooms');
        toast.error('Failed to load chat rooms');
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Fetch messages when room changes
  useEffect(() => {
    if (!activeRoom) return;

    const fetchMessages = async () => {
      try {
        console.log('Fetching messages for room:', activeRoom.id);
        const response = await api.get(`/chat/${activeRoom.id}/messages`);
        console.log('Fetched messages:', response.data);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      }
    };

    fetchMessages();

    // Join the room via Socket.io
    if (socket) {
      console.log('Joining room via socket:', activeRoom.id);
      socket.emit('join_room', {
        room: activeRoom.id,
        userId: user.id,
        userName: user.name,
        userRole: user.role
      });
    }

    // Cleanup: leave room when room changes
    return () => {
      if (socket && activeRoom) {
        socket.emit('leave_room', {
          room: activeRoom.id,
          userName: user.name
        });
      }
    };
  }, [activeRoom, socket, user]);

  // Socket.io event listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      console.log('Received message:', message);
      setMessages((prev) => [...prev, message]);
    };

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

    const handleError = (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'An error occurred');
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('error', handleError);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('error', handleError);
    };
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !socket || !activeRoom) return;

    const messageData = {
      room: activeRoom.id,
      sender: user.id,
      senderName: user.name,
      senderRole: user.role,
      content: newMessage.trim()
    };

    console.log('Sending message:', messageData);
    socket.emit('send_message', messageData);
    socket.emit('stop_typing', { room: activeRoom.id, userName: user.name });

    setNewMessage('');
  };

  const handleTyping = () => {
    if (!socket || !activeRoom) return;

    socket.emit('typing', { room: activeRoom.id, userName: user.name });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { room: activeRoom.id, userName: user.name });
    }, 1000);
  };

  // Early return if no user
  if (!user) {
    console.log('No user, returning null');
    return null;
  }

  return (
    <div
      className="fixed bottom-24 right-6 bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col overflow-hidden"
      style={{
        width: '500px',
        height: '600px',
        zIndex: 9999
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
        <h3 className="font-bold text-lg">Chat</h3>
        <button
          onClick={onClose}
          className="hover:bg-blue-700 p-1 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-40 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              <div>Loading...</div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              <div>No rooms available</div>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    console.log('Selecting room:', room);
                    setActiveRoom(room);
                  }}
                  className={`w-full text-left p-2 rounded text-xs transition-colors ${
                    activeRoom?.id === room.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {room.type === 'staff' ? (
                      <Users className="w-3 h-3" />
                    ) : (
                      <BookOpen className="w-3 h-3" />
                    )}
                    <div className="flex-1 truncate font-semibold">
                      {room.type === 'staff' ? 'Staff' : room.courseCode}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {!activeRoom ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              Select a room to start chatting
            </div>
          ) : (
            <>
              {/* Room Header */}
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="font-semibold text-sm text-gray-800 truncate">
                  {activeRoom.name}
                </div>
                {activeRoom.type === 'course' && (
                  <div className="text-xs text-gray-500 truncate">
                    {activeRoom.courseCode}
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 bg-white">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500 text-xs">
                      <p>No messages yet</p>
                      <p className="mt-1">Be the first to send a message!</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {messages.map((message, index) => (
                      <ChatMessage key={message._id || index} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {typing && (
                  <div className="text-xs text-gray-500 italic mt-2">
                    {typing} is typing...
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPopup;
