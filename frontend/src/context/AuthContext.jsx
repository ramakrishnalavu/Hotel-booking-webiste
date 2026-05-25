import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [bookingState, setBookingState] = useState({
    hotelId: null,
    hotelName: '',
    roomId: null,
    roomNumber: '',
    pricePerNight: 0,
    checkIn: '',
    checkOut: '',
    couponCode: '',
    discountPercent: 0
  });

  // Custom Toast Notification System: Expose globally
  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Automatically auto-clear toast after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Restore session from localStorage on application hydration
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    // Listen to global 401 Unauthorized interceptor event
    const handleUnauthorized = () => {
      logout();
      showToast('Session expired. Please log in again.', 'error');
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token: jwt, id, fullName, role, loyaltyPoints } = response.data;
      
      const userData = { id, email, fullName, role, loyaltyPoints };
      
      localStorage.setItem('token', jwt);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(jwt);
      setUser(userData);
      
      showToast(`Welcome back, ${fullName}!`, 'success');
      return { success: true, role };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed. Please check credentials.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  };

  const register = async (fullName, email, password, phone, role) => {
    try {
      await api.post('/api/auth/register', { fullName, email, password, phone, role });
      showToast('Registration successful! Please log in.', 'success');
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.', 'info');
  };

  const updateLoyaltyPoints = (points) => {
    if (user) {
      const updatedUser = { ...user, loyaltyPoints: points };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      logout, 
      bookingState, 
      setBookingState, 
      showToast,
      updateLoyaltyPoints 
    }}>
      {children}
      
      {/* Dynamic Toast Alerts Renderer */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="toast-icon">
              {toast.type === 'success' && '🟢'}
              {toast.type === 'error' && '🔴'}
              {toast.type === 'warning' && '🟡'}
              {toast.type === 'info' && '🔵'}
            </div>
            <div className="toast-message">{toast.message}</div>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
