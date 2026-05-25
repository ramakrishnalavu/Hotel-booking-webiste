import React from 'react';
import { Link } from 'react-router-dom';

const Page404 = () => {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '40px', maxWidth: '450px', textAlign: 'center' }}>
        <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>🌌</span>
        <h2 className="gradient-text" style={{ fontSize: '32px', marginBottom: '8px' }}>404 - Lost in Space</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>
          The cosmic page coordinates you requested do not exist in our galaxy.
        </p>
        <Link to="/" className="btn btn-primary" style={{ padding: '12px 30px' }}>
          Back to Safety
        </Link>
      </div>
    </div>
  );
};

export default Page404;
