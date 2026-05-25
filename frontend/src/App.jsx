import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import HotelDetails from './pages/HotelDetails';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import BookingHistory from './pages/BookingHistory';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Error pages
import Page401 from './pages/errors/Page401';
import Page403 from './pages/errors/Page403';
import Page404 from './pages/errors/Page404';

function App() {
  return (
    <>
      {/* Global Navbar */}
      <Navbar />

      {/* Main Pages router */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/hotel/:id" element={<HotelDetails />} />

          {/* User Protected Routes (Requires standard login) */}
          <Route 
            path="/booking" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_MANAGER', 'ROLE_ADMIN']}>
                <BookingPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_MANAGER', 'ROLE_ADMIN']}>
                <PaymentPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_USER']}>
                <BookingHistory />
              </ProtectedRoute>
            } 
          />

          {/* Manager & Admin Protected Routes */}
          <Route 
            path="/manager" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_MANAGER', 'ROLE_ADMIN']}>
                <ManagerDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin Exclusive Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Explicit Error Routes */}
          <Route path="/401" element={<Page401 />} />
          <Route path="/403" element={<Page403 />} />
          <Route path="*" element={<Page404 />} />
        </Routes>
      </div>

      {/* Elegant Footer */}
      <footer 
        style={{ 
          padding: '30px 24px', 
          borderTop: '1px solid var(--border-glass)', 
          textAlign: 'center', 
          marginTop: '60px',
          background: 'rgba(10, 11, 16, 0.4)'
        }}
      >
        <div className="container" style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
          <p>© 2026 Nebula Stay Suite. Designed with futuristic dark glassmorphic aesthetics.</p>
          <p style={{ marginTop: '4px', fontSize: '12px' }}>
            Built using Spring Boot 3 + React + JWT + PostgreSQL + Redis Outage Safe Caching
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;
