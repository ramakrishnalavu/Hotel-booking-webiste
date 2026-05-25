import React from 'react';
import { Link } from 'react-router-dom';

const Page401 = () => {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '40px', maxWidth: '450px', textAlign: 'center' }}>
        <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>🔒</span>
        <h2 className="gradient-text" style={{ fontSize: '32px', marginBottom: '8px' }}>401 - Unauthorized</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>
          Authentication is required to view this premium resource. Please sign in to verify your identity.
        </p>
        <Link to="/login" className="btn btn-primary" style={{ padding: '12px 30px' }}>
          Proceed to Login
        </Link>
      </div>
    </div>
  );
};

export default Page401;
