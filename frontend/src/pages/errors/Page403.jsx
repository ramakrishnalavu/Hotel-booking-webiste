import React from 'react';
import { Link } from 'react-router-dom';

const Page403 = () => {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '40px', maxWidth: '450px', textAlign: 'center' }}>
        <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>🚫</span>
        <h2 className="gradient-text" style={{ fontSize: '32px', marginBottom: '8px' }}>403 - Forbidden</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>
          Access Denied! You do not have the required role privileges or permissions to browse this administrative segment.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-secondary">
            Back Home
          </Link>
          <Link to="/login" className="btn btn-primary">
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page403;
