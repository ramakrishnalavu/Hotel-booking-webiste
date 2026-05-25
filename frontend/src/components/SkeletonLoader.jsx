import React from 'react';

const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  const items = Array.from({ length: count });

  if (type === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        {items.map((_, i) => (
          <div key={i} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="skeleton" style={{ height: '20px', width: '35%' }}></div>
            <div className="skeleton" style={{ height: '14px', width: '85%' }}></div>
            <div className="skeleton" style={{ height: '14px', width: '50%' }}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="hotel-grid">
      {items.map((_, i) => (
        <div key={i} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          {/* Card Image Skeleton */}
          <div className="skeleton" style={{ height: '200px', width: '100%', borderRadius: '0' }}></div>
          
          {/* Card Details Skeleton */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="flex-between">
              <div className="skeleton" style={{ height: '20px', width: '60%' }}></div>
              <div className="skeleton" style={{ height: '16px', width: '15%', borderRadius: '10px' }}></div>
            </div>
            <div className="skeleton" style={{ height: '14px', width: '90%' }}></div>
            <div className="skeleton" style={{ height: '14px', width: '40%' }}></div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <div className="skeleton" style={{ height: '22px', width: '70px', borderRadius: '12px' }}></div>
              <div className="skeleton" style={{ height: '22px', width: '70px', borderRadius: '12px' }}></div>
              <div className="skeleton" style={{ height: '22px', width: '70px', borderRadius: '12px' }}></div>
            </div>
            <div className="skeleton" style={{ height: '40px', width: '100%', marginTop: '12px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
