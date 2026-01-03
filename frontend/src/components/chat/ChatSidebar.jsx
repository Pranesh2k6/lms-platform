import React from 'react';

const ChatSidebar = ({ rooms, activeRoom, onRoomSelect }) => {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Chat Rooms</h2>
      </div>

      <div className="p-2">
        {rooms.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No chat rooms available</p>
          </div>
        ) : (
          rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onRoomSelect(room)}
              className={`w-full text-left p-3 mb-2 rounded-lg transition-colors ${
                activeRoom?.id === room.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {room.type === 'staff' ? (
                  <span className="text-xl">👥</span>
                ) : (
                  <span className="text-xl">📚</span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {room.name}
                  </div>
                  {room.type === 'staff' && (
                    <div
                      className={`text-xs mt-0.5 ${
                        activeRoom?.id === room.id
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {room.description}
                    </div>
                  )}
                  {room.type === 'course' && (
                    <div
                      className={`text-xs mt-0.5 ${
                        activeRoom?.id === room.id
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      }`}
                    >
                      Course Chat
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
