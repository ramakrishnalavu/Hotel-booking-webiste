import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { showToast } = useAuth();

  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  // System states
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const tabs = [
    { id: 'users', label: 'User Operations', icon: '👥' },
    { id: 'bookings', label: 'Monitor Bookings', icon: '🧳' },
    { id: 'logs', label: 'Diagnostics Logs', icon: '💻' }
  ];

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      showToast('Error loading registered users list.', 'error');
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await api.get('/api/admin/bookings');
      setBookings(response.data);
    } catch (error) {
      showToast('Error loading system bookings catalog.', 'error');
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get('/api/admin/logs');
      setLogs(response.data);
    } catch (error) {
      showToast('Error loading system trace diagnostics.', 'error');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchUsers();
    await fetchBookings();
    await fetchLogs();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Block/unblock user toggle handler
  const handleToggleUserStatus = async (id, isBlocked) => {
    setUpdatingUserId(id);
    const actionBlock = !isBlocked; // toggle action
    try {
      await api.put(`/api/admin/users/${id}/status`, null, {
        params: { block: actionBlock }
      });
      showToast(actionBlock ? 'User account blocked successfully.' : 'User account unblocked.', 'success');
      fetchUsers(); // Refresh users list
    } catch (error) {
      showToast('Failed to toggle user status privileges.', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="container" style={{ paddingBottom: '60px', textAlign: 'left' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>System Administrator Panel</h2>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />

        {/* Content pane */}
        <div style={{ flexGrow: 1, flexBasis: '600px' }}>
          {/* TAB 1: User Operations control */}
          {activeTab === 'users' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                👥 Registered Users Catalog
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {users.map((u) => {
                  const isBlocked = u.fullName.includes('(BLOCKED)');
                  return (
                    <div 
                      key={u.id}
                      className="glass-panel flex-between"
                      style={{
                        padding: '14px 20px',
                        background: isBlocked ? 'rgba(239, 68, 68, 0.03)' : 'rgba(255,255,255,0.01)',
                        borderColor: isBlocked ? 'rgba(239, 68, 68, 0.15)' : 'var(--border-glass)'
                      }}
                    >
                      <div>
                        <strong style={{ color: 'var(--text-active)' }}>{u.fullName}</strong>
                        <span className="badge badge-role" style={{ fontSize: '9px', padding: '1px 5px', marginLeft: '10px' }}>
                          {u.role.replace('ROLE_', '')}
                        </span>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                          📧 {u.email} | 📞 {u.phone || 'N/A'} | 🌟 {u.loyaltyPoints} pts
                        </p>
                      </div>

                      {/* Control button */}
                      {u.role !== 'ROLE_ADMIN' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id, isBlocked)}
                          disabled={updatingUserId === u.id}
                          className={`btn ${isBlocked ? 'btn-accent' : 'btn-danger'}`}
                          style={{ padding: '6px 14px', fontSize: '12px' }}
                        >
                          {updatingUserId === u.id ? '...' : isBlocked ? 'Unblock' : 'Block User'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Global Reservation monitor */}
          {activeTab === 'bookings' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                🧳 System-wide Bookings Audit
              </h3>

              {bookings.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', padding: '12px 0' }}>
                  No reservations configured inside the system yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {bookings.map((b) => (
                    <div 
                      key={b.id} 
                      className="glass-panel flex-between"
                      style={{ 
                        padding: '14px 20px',
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.02)'
                      }}
                    >
                      <div>
                        <strong style={{ color: 'var(--text-active)' }}>{b.hotelName} (Room #{b.roomNumber})</strong>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                          Res Code: <span style={{ color: 'var(--text-active)', fontWeight: 500 }}>{b.reservationNumber}</span> | Total: <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>${b.totalAmount.toFixed(2)}</span>
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Dates: {b.checkInDate} to {b.checkOutDate}
                        </p>
                      </div>
                      <span className={`badge ${b.bookingStatus === 'CONFIRMED' ? 'badge-available' : 'badge-booked'}`}>
                        {b.bookingStatus}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Simulated Live Trace Log Stream */}
          {activeTab === 'logs' && (
            <div className="glass-panel" style={{ padding: '24px', background: '#07080c' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                💻 Server Terminal Logs Diagnostic
              </h3>
              
              <div 
                style={{ 
                  fontFamily: 'monospace',
                  fontSize: '12.5px',
                  color: '#39ff14', // Matrix Green
                  background: 'black',
                  padding: '16px',
                  borderRadius: 'var(--border-radius-sm)',
                  border: '1px solid #1f2430',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  textAlign: 'left'
                }}
              >
                {logs.map((log, i) => (
                  <div key={i} style={{ lineBreak: 'anywhere' }}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
