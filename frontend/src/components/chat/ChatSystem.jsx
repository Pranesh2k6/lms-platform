import React, { useState, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ChatSystem = () => {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await api.get('/chat/rooms');
        setRooms(response.data);

        // Auto-select first room if available
        if (response.data.length > 0) {
          setActiveRoom(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        toast.error('Failed to load chat rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleRoomSelect = (room) => {
    setActiveRoom(room);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white rounded-lg shadow-md overflow-hidden">
      <ChatSidebar
        rooms={rooms}
        activeRoom={activeRoom}
        onRoomSelect={handleRoomSelect}
      />
      <ChatWindow room={activeRoom} />
    </div>
  );
};

export default ChatSystem;
