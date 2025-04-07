
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <div className="app-container">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/chat" element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          } />
          <Route path="/profile/:userId" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
