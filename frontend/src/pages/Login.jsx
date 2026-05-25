import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    // Email Validation Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email formatting';
    }

    // Password Validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error dynamically on keystroke
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const result = await login(formData.email, formData.password);
    setSubmitting(false);

    if (result.success) {
      // Role-based routing upon successful authorization
      if (result.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if (result.role === 'ROLE_MANAGER') {
        navigate('/manager');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%', 
          maxWidth: '420px', 
          padding: '36px 30px', 
          background: 'var(--bg-glass-card)',
          textAlign: 'center' 
        }}
      >
        <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>🌌</span>
        <h2 className="gradient-text" style={{ fontSize: '28px', marginBottom: '6px' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '28px' }}>
          Enter your credentials to unlock access
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Email input */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="e.g. user@hotel.com"
              value={formData.email}
              onChange={handleChange}
              disabled={submitting}
              style={{ borderColor: errors.email ? '#ef4444' : 'var(--border-glass)' }}
            />
            {errors.email && (
              <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>
                ⚠ {errors.email}
              </span>
            )}
          </div>

          {/* Password input */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={submitting}
              style={{ borderColor: errors.password ? '#ef4444' : 'var(--border-glass)' }}
            />
            {errors.password && (
              <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>
                ⚠ {errors.password}
              </span>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            New to Nebula Stay?{' '}
            <Link to="/register" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
