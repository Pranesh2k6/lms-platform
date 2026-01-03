import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FloatingChatButton from './components/chat/FloatingChatButton';
import AgentChat from './components/ai/AgentChat';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const [showAIChat, setShowAIChat] = useState(false);

  // Show chat button only when logged in and not on login page
  const showChatButton = user && location.pathname !== '/';

  // Show AI Assistant only for admin and professor
  const canUseAI = user && (user.role === 'admin' || user.role === 'professor');

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {showChatButton && <FloatingChatButton />}

      {/* AI Assistant FAB - only for admin/professor */}
      {canUseAI && showChatButton && !showAIChat && (
        <button
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50 flex items-center justify-center"
          title="AI Assistant"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {/* AI Chat Window */}
      {showAIChat && <AgentChat onClose={() => setShowAIChat(false)} />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
