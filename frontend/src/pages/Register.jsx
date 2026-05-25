import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract invite code, e.g. ?invite=manager or ?invite=admin
  const inviteType = searchParams.get('invite')?.trim().toLowerCase();
  const initialRole = inviteType === 'manager' ? 'MANAGER' : (inviteType === 'admin' ? 'ADMIN' : 'USER');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: initialRole
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name is required (min 2 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email formatting';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return { label: '', color: '' };
    if (p.length < 6) return { label: 'Weak (too short)', color: '#ef4444' };
    
    let strength = 0;
    if (/[A-Z]/.test(p)) strength++;
    if (/[0-9]/.test(p)) strength++;
    if (/[^A-Za-z0-9]/.test(p)) strength++;

    if (strength === 3) return { label: 'Strong (Secure)', color: '#10b981' };
    if (strength === 2) return { label: 'Medium', color: 'var(--accent-gold)' };
    return { label: 'Weak (needs uppercase/symbol)', color: '#ef4444' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const result = await register(
      formData.fullName,
      formData.email,
      formData.password,
      formData.phone,
      formData.role
    );
    setSubmitting(false);

    if (result.success) {
      navigate('/login');
    }
  };

  const strength = getPasswordStrength();

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%', 
          maxWidth: '460px', 
          padding: '36px 30px', 
          background: 'var(--bg-glass-card)',
          textAlign: 'center' 
        }}
      >
        <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>🌌</span>
        <h2 className="gradient-text" style={{ fontSize: '28px', marginBottom: '6px' }}>Create Account</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '24px' }}>
          Embark on your luxury booking journey
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Full name input */}
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="form-input"
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={handleChange}
              disabled={submitting}
              style={{ borderColor: errors.fullName ? '#ef4444' : 'var(--border-glass)' }}
            />
            {errors.fullName && (
              <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>
                ⚠ {errors.fullName}
              </span>
            )}
          </div>

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
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="•••••••• (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              disabled={submitting}
              style={{ borderColor: errors.password ? '#ef4444' : 'var(--border-glass)' }}
            />
            {strength.label && (
              <span style={{ color: strength.color, fontSize: '11px', fontWeight: 600, marginTop: '2px', textAlign: 'left' }}>
                Strength: {strength.label}
              </span>
            )}
            {errors.password && (
              <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>
                ⚠ {errors.password}
              </span>
            )}
          </div>

          {/* Phone input */}
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="text"
              className="form-input"
              placeholder="e.g. 9959597124"
              value={formData.phone}
              onChange={handleChange}
              disabled={submitting}
              style={{ borderColor: errors.phone ? '#ef4444' : 'var(--border-glass)' }}
            />
            {errors.phone && (
              <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>
                ⚠ {errors.phone}
              </span>
            )}
          </div>

          {/* Custom Read-Only Invite Badge indicator */}
          {formData.role !== 'USER' && (
            <div 
              className="glass-panel" 
              style={{ 
                padding: '12px 16px', 
                background: 'rgba(127, 90, 240, 0.08)', 
                border: '1px solid rgba(127, 90, 240, 0.2)', 
                marginBottom: '20px', 
                textAlign: 'center' 
              }}
            >
              <span className="badge badge-role" style={{ fontSize: '11px', padding: '3px 8px' }}>
                Secure Elevated Role: {formData.role === 'MANAGER' ? 'Manager' : 'Admin'} Invite Mode Active
              </span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            disabled={submitting}
          >
            {submitting ? 'Creating Profile...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
