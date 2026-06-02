import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import NormalUserDashboard from './components/NormalUserDashboard';
import StoreOwnerDashboard from './components/StoreOwnerDashboard';
import ChangePasswordModal from './components/ChangePasswordModal';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));
  
  // Navigation states
  const [currentView, setCurrentView] = useState('login'); // login, register, dashboard
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // Notification states
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: '' }

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch logged in profile details
  const fetchProfile = async (authToken) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setCurrentView('dashboard');
      } else {
        // Token invalid
        handleLogout();
        showNotification('error', 'Session expired. Please log in again.');
      }
    } catch (err) {
      console.error(err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleLoginSuccess = (userToken, userProfile) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userProfile);
    setCurrentView('dashboard');
    showNotification('success', `Welcome back, ${userProfile.name}!`);
  };

  const handleRegisterSuccess = () => {
    setCurrentView('login');
    showNotification('success', 'Registration successful! You can now log in.');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setCurrentView('login');
    showNotification('success', 'Logged out successfully.');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Verifying security credentials...</span>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-wrapper animate-fade-in">
      
      {/* 1. Global Notification Banner */}
      {notification && (
        <div 
          className="glass-container"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1100,
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderLeft: `4px solid ${notification.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
            background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            boxShadow: 'var(--shadow)',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          {notification.type === 'success' ? (
            <CheckCircle size={20} color="var(--success)" />
          ) : (
            <AlertCircle size={20} color="var(--error)" />
          )}
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{notification.message}</span>
        </div>
      )}

      {/* 2. Logged In Navbar */}
      {user && (
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          onChangePasswordClick={() => setIsPasswordModalOpen(true)} 
        />
      )}

      {/* 3. Main Views router */}
      {currentView === 'login' && (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onNavigateToRegister={() => setCurrentView('register')} 
        />
      )}

      {currentView === 'register' && (
        <Register 
          onRegisterSuccess={handleRegisterSuccess} 
          onNavigateToLogin={() => setCurrentView('login')} 
        />
      )}

      {currentView === 'dashboard' && user && (
        <>
          {user.role === 'Admin' && <AdminDashboard token={token} />}
          {user.role === 'User' && <NormalUserDashboard token={token} />}
          {user.role === 'StoreOwner' && <StoreOwnerDashboard token={token} />}
        </>
      )}

      {/* 4. Password Modal Overlay */}
      {user && (
        <ChangePasswordModal 
          isOpen={isPasswordModalOpen} 
          onClose={() => setIsPasswordModalOpen(false)} 
          token={token} 
        />
      )}
      
    </div>
  );
}
