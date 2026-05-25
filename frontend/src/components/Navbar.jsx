import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <nav 
      className="glass-panel" 
      style={{ 
        margin: '16px 24px 24px 24px', 
        borderRadius: 'var(--border-radius-sm)',
        position: 'sticky',
        top: '16px',
        zIndex: 100,
        background: 'rgba(15, 17, 26, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.05)'
      }}
    >
      <div className="container flex-between" style={{ height: '70px' }}>
        {/* Branding Logo */}
        <Link 
          to="/" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            textDecoration: 'none' 
          }}
        >
          <span style={{ fontSize: '24px' }}>🌌</span>
          <span 
            className="gradient-text" 
            style={{ 
              fontWeight: 800, 
              fontSize: '22px', 
              letterSpacing: '0.05em' 
            }}
          >
            NEBULA STAY
          </span>
        </Link>

        {/* Desktop Menu links */}
        <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" className="nav-link">Home</Link>
          
          {user && (
            <>
              {/* Standard User routes */}
              {user.role === 'ROLE_USER' && (
                <Link to="/history" className="nav-link">My Bookings</Link>
              )}
              
              {/* Manager specific routes */}
              {(user.role === 'ROLE_MANAGER' || user.role === 'ROLE_ADMIN') && (
                <Link to="/manager" className="nav-link">Manager Panel</Link>
              )}
              
              {/* Admin specific routes */}
              {user.role === 'ROLE_ADMIN' && (
                <Link to="/admin" className="nav-link">Admin Panel</Link>
              )}
            </>
          )}

          {/* Authentication buttons */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '12px' }}>
              <div 
                className="glass-panel" 
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '12px', 
                  fontSize: '13px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span className="badge badge-role" style={{ padding: '2px 6px', fontSize: '10px' }}>
                  {user.role === 'ROLE_ADMIN' ? 'Admin' : user.role === 'ROLE_MANAGER' ? 'Manager' : 'Guest'}
                </span>
                <span style={{ color: 'var(--text-active)', fontWeight: 500 }}>{user.fullName}</span>
                <span style={{ color: 'var(--text-muted)' }}>|</span>
                <span style={{ color: 'var(--accent-cyan)' }}>🌟 {user.loyaltyPoints} pts</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px' }}>
              <Link to="/login" className="nav-link" style={{ marginRight: '8px' }}>Sign In</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger Trigger for Mobile */}
        <button 
          className="mobile-burger"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-active)',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'none'
          }}
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Dropdown Drawer */}
      {isOpen && (
        <div 
          className="glass-panel mobile-drawer" 
          style={{ 
            position: 'absolute',
            top: '78px',
            left: 0,
            right: 0,
            margin: '0 24px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'var(--bg-glass-card)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
            zIndex: 99
          }}
        >
          <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Home</Link>
          {user && (
            <>
              {user.role === 'ROLE_USER' && (
                <Link to="/history" className="nav-link" onClick={() => setIsOpen(false)}>My Bookings</Link>
              )}
              {(user.role === 'ROLE_MANAGER' || user.role === 'ROLE_ADMIN') && (
                <Link to="/manager" className="nav-link" onClick={() => setIsOpen(false)}>Manager Panel</Link>
              )}
              {user.role === 'ROLE_ADMIN' && (
                <Link to="/admin" className="nav-link" onClick={() => setIsOpen(false)}>Admin Panel</Link>
              )}
            </>
          )}

          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', margin: '8px 0 0 0' }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-active)', fontWeight: 500 }}>
                  Logged in as: <span style={{ color: 'var(--accent-blue)' }}>{user.fullName}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Loyalty Points: <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>🌟 {user.loyaltyPoints} pts</span>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setIsOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ width: '100%' }} onClick={() => setIsOpen(false)}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Styled Embed for Links */}
      <style>{`
        .nav-link {
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 500;
          font-size: 15px;
          transition: var(--transition-smooth);
          padding: 8px 4px;
          border-bottom: 2px solid transparent;
        }
        .nav-link:hover {
          color: var(--accent-cyan);
          border-bottom-color: var(--accent-cyan);
        }
        
        @media (max-width: 900px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-burger {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
