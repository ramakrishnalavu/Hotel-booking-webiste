import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div 
      className="glass-panel" 
      style={{ 
        width: '260px', 
        padding: '24px 16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px',
        alignSelf: 'stretch',
        background: 'rgba(15, 17, 26, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.04)'
      }}
    >
      <div style={{ marginBottom: '16px', paddingLeft: '8px' }}>
        <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Navigation Control
        </h4>
      </div>

      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-sm)',
              border: 'none',
              background: isActive ? 'linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(127, 90, 240, 0.15) 100%)' : 'transparent',
              color: isActive ? 'var(--text-active)' : 'var(--text-primary)',
              fontFamily: 'var(--font-base)',
              fontSize: '15px',
              fontWeight: isActive ? 600 : 500,
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
              boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none'
            }}
          >
            <span style={{ fontSize: '18px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Sidebar;
