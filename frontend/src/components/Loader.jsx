import React from 'react';

const Loader = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 11, 16, 0.85)',
          backdropFilter: 'blur(16px)',
          zIndex: 9999
        }}
        className="flex-center"
      >
        <div className="flex-center" style={{ flexDirection: 'column', gap: '16px' }}>
          <div className="spinner"></div>
          <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>
            LOADING SYSTEM...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-center" style={{ padding: '24px', flexDirection: 'column', gap: '12px' }}>
      <div className="spinner"></div>
      <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Fetching data...</span>
    </div>
  );
};

export default Loader;
