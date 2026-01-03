import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { X, Send, Loader2, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';
import FileUploadZone from './FileUploadZone';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AgentChat = ({ onClose }) => {
  const { user } = useAuth();
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/ai-agent/chat',
    fetch: async (input, init) => {
      const token = localStorage.getItem('token');
      return fetch(input, {
        ...init,
        headers: {
          ...init.headers,
          Authorization: `Bearer ${token}`
        }
      });
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast.error(error.message || 'Failed to send message');
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileProcessed = (data) => {
    if (data.success && data.students.length > 0) {
      // Create a message suggesting what to do with the parsed data
      const studentList = data.students
        .slice(0, 5)
        .map((s) => `${s.name} (${s.email})`)
        .join(', ');

      const moreCount = data.students.length - 5;
      const summary = `I've parsed ${data.students.length} student(s) from your file: ${studentList}${
        moreCount > 0 ? `, and ${moreCount} more` : ''
      }. Would you like me to add them to a section?`;

      toast.success(summary);
      setShowFileUpload(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSubmit(e);
  };

  return (
    <div className="fixed bottom-6 right-6 w-[500px] h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs text-blue-100">Powered by Google Gemini</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Hello, {user?.name}!
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              I'm your AI assistant. I can help you with:
            </p>
            <div className="text-left max-w-sm mx-auto space-y-2 text-sm text-gray-700">
              <p>• Creating courses and sections</p>
              <p>• Adding students and enrolling them</p>
              <p>• Creating calendar events</p>
              <p>• Parsing student lists from files</p>
              <p>• Retrieving system information</p>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Try: "How many courses are in the system?"
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.role === 'user'}
              />
            ))}

            {isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
                <div className="bg-gray-100 text-gray-900 border border-gray-200 rounded-lg px-4 py-2">
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-xs text-red-600">Error: {error.message}</p>
        </div>
      )}

      {/* File Upload Zone (toggleable) */}
      {showFileUpload && (
        <FileUploadZone onFileProcessed={handleFileProcessed} />
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={onSubmit} className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowFileUpload(!showFileUpload)}
            className={`px-3 py-2 rounded-lg transition ${
              showFileUpload
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Upload file"
          >
            📎
          </button>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default AgentChat;
