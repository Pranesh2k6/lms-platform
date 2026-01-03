import { Bot, User } from 'lucide-react';

const MessageBubble = ({ message, isUser }) => {
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600' : 'bg-gray-600'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={`max-w-[75%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900 border border-gray-200'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

        {/* Tool calls indicator */}
        {message.toolInvocations && message.toolInvocations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-300">
            {message.toolInvocations.map((tool, idx) => (
              <div key={idx} className="text-xs opacity-75 mb-1">
                {tool.state === 'call' && (
                  <span>🔧 Calling {tool.toolName}...</span>
                )}
                {tool.state === 'result' && (
                  <span>✅ {tool.toolName} completed</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
