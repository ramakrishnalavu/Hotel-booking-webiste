import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const ManagerDashboard = () => {
  const { showToast } = useAuth();
  
  const [activeTab, setActiveTab] = useState('rooms');
  const [loading, setLoading] = useState(true);

  // Data states
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Forms state
  const [roomForm, setRoomForm] = useState({ roomNumber: '', roomType: 'SINGLE', pricePerNight: 100, maxGuests: 2, status: 'AVAILABLE' });
  const [couponForm, setCouponForm] = useState({ code: '', discountPercent: 10, expiryDate: '' });
  
  const [submittingRoom, setSubmittingRoom] = useState(false);
  const [submittingCoupon, setSubmittingCoupon] = useState(false);

  const tabs = [
    { id: 'rooms', label: 'Room Inventory', icon: '🔑' },
    { id: 'coupons', label: 'Create Coupons', icon: '🎟' },
    { id: 'analytics', label: 'Business Stats', icon: '📊' }
  ];

  const fetchHotels = async () => {
    try {
      const response = await api.get('/api/hotels');
      setHotels(response.data);
      if (response.data.length > 0) {
        setSelectedHotelId(response.data[0].id);
      }
    } catch (error) {
      showToast('Error loading hotels catalog.', 'error');
    }
  };

  const fetchRooms = async (hotelId) => {
    if (!hotelId) return;
    try {
      const response = await api.get(`/api/rooms/hotel/${hotelId}`);
      setRooms(response.data);
    } catch (error) {
      showToast('Error loading rooms catalog.', 'error');
    }
  };

  const fetchCoupons = async () => {
    try {
      // Mocking/getting list of coupons if available or listing from analytics
      // We can fetch coupons directly or just mock since backend doesn't list all coupons, or let's pull from analytics
      // We will provide coupon creations!
    } catch (e) {}
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/manager/analytics');
      setAnalytics(response.data);
    } catch (error) {
      showToast('Error loading business analytics metrics.', 'error');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchHotels();
    await fetchAnalytics();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedHotelId) {
      fetchRooms(selectedHotelId);
    }
  }, [selectedHotelId]);

  // Create Room handler
  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    if (!roomForm.roomNumber) {
      showToast('Room number is required!', 'warning');
      return;
    }

    setSubmittingRoom(true);
    try {
      await api.post(`/api/manager/rooms/hotel/${selectedHotelId}`, roomForm);
      showToast(`Room #${roomForm.roomNumber} added successfully!`, 'success');
      
      // Reset form
      setRoomForm({ roomNumber: '', roomType: 'SINGLE', pricePerNight: 100, maxGuests: 2, status: 'AVAILABLE' });
      fetchRooms(selectedHotelId);
    } catch (error) {
      showToast('Failed to create room.', 'error');
    } finally {
      setSubmittingRoom(false);
    }
  };

  // Create Coupon handler
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.expiryDate) {
      showToast('Coupon code and expiration date are required!', 'warning');
      return;
    }

    setSubmittingCoupon(true);
    try {
      const payload = {
        code: couponForm.code.trim().toUpperCase(),
        discountPercent: parseFloat(couponForm.discountPercent),
        expiryDate: couponForm.expiryDate
      };
      await api.post('/api/manager/coupons', payload);
      showToast(`Coupon ${payload.code} created successfully!`, 'success');
      
      // Reset
      setCouponForm({ code: '', discountPercent: 10, expiryDate: '' });
      fetchAnalytics(); // Refresh coupon counts/lists
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to create coupon.';
      showToast(errMsg, 'error');
    } finally {
      setSubmittingCoupon(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room from hotel inventory?')) return;
    try {
      await api.delete(`/api/manager/rooms/${roomId}`);
      showToast('Room removed successfully.', 'success');
      fetchRooms(selectedHotelId);
    } catch (error) {
      showToast('Failed to delete room.', 'error');
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="container" style={{ paddingBottom: '60px', textAlign: 'left' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Manager Control Dashboard</h2>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />

        {/* Content pane */}
        <div style={{ flexGrow: 1, flexBasis: '600px' }}>
          {/* TAB 1: Rooms Inventory management */}
          {activeTab === 'rooms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                  🆕 Add Room to Hotel
                </h3>
                
                {/* Select hotel */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Target Hotel Profile</label>
                  <select 
                    className="form-input"
                    value={selectedHotelId || ''}
                    onChange={(e) => setSelectedHotelId(parseInt(e.target.value))}
                    style={{ background: 'var(--bg-secondary)', cursor: 'pointer' }}
                  >
                    {hotels.map((h) => (
                      <option key={h.id} value={h.id}>{h.hotelName} ({h.city})</option>
                    ))}
                  </select>
                </div>

                {/* Form fields grid */}
                <form onSubmit={handleRoomSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: '1 1 120px', marginBottom: 0 }}>
                    <label className="form-label">Room Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 301"
                      value={roomForm.roomNumber}
                      onChange={(e) => setRoomForm(r => ({ ...r, roomNumber: e.target.value }))}
                      disabled={submittingRoom}
                    />
                  </div>
                  <div className="form-group" style={{ flex: '1 1 140px', marginBottom: 0 }}>
                    <label className="form-label">Room Type</label>
                    <select 
                      className="form-input"
                      value={roomForm.roomType}
                      onChange={(e) => setRoomForm(r => ({ ...r, roomType: e.target.value }))}
                      style={{ background: 'var(--bg-secondary)', cursor: 'pointer' }}
                    >
                      <option value="SINGLE">SINGLE</option>
                      <option value="DOUBLE">DOUBLE</option>
                      <option value="SUITE">SUITE</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: '1 1 120px', marginBottom: 0 }}>
                    <label className="form-label">Price / Night</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={roomForm.pricePerNight}
                      onChange={(e) => setRoomForm(r => ({ ...r, pricePerNight: parseFloat(e.target.value) }))}
                      disabled={submittingRoom}
                    />
                  </div>
                  <div className="form-group" style={{ flex: '1 1 120px', marginBottom: 0 }}>
                    <label className="form-label">Max Guests</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={roomForm.maxGuests}
                      onChange={(e) => setRoomForm(r => ({ ...r, maxGuests: parseInt(e.target.value) }))}
                      disabled={submittingRoom}
                    />
                  </div>
                  <button type="submit" className="btn btn-accent" style={{ padding: '12px 24px', flex: '1 1 120px' }}>
                    {submittingRoom ? 'Adding...' : 'Add Room'}
                  </button>
                </form>
              </div>

              {/* Rooms Lists */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                  📋 Current Room Inventories
                </h3>

                {rooms.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', padding: '12px 0' }}>No rooms configured inside this hotel yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {rooms.map((room) => (
                      <div 
                        key={room.id} 
                        className="glass-panel flex-between" 
                        style={{ 
                          padding: '12px 20px', 
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid rgba(255,255,255,0.02)'
                        }}
                      >
                        <div>
                          <strong style={{ color: 'var(--text-active)' }}>Room #{room.roomNumber}</strong>
                          <span className="badge badge-role" style={{ fontSize: '9px', padding: '1px 5px', marginLeft: '10px' }}>
                            {room.roomType}
                          </span>
                          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                            Price: <strong style={{ color: 'var(--accent-cyan)' }}>${room.pricePerNight}/night</strong> | Max Guests: {room.maxGuests}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteRoom(room.id)}
                          className="btn btn-danger"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Create Promo Coupons */}
          {activeTab === 'coupons' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                🎟 Add Discount Coupon Code
              </h3>

              <form onSubmit={handleCouponSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                <div className="form-group">
                  <label className="form-label">Coupon Code (Unique String)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. SUMMER50"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm(c => ({ ...c, code: e.target.value }))}
                    disabled={submittingCoupon}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Percentage (1 - 100%)</label>
                  <input 
                    type="number" 
                    min={1}
                    max={100}
                    className="form-input" 
                    value={couponForm.discountPercent}
                    onChange={(e) => setCouponForm(c => ({ ...c, discountPercent: parseFloat(e.target.value) }))}
                    disabled={submittingCoupon}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label">Expiration Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={couponForm.expiryDate}
                    onChange={(e) => setCouponForm(c => ({ ...c, expiryDate: e.target.value }))}
                    disabled={submittingCoupon}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px' }} disabled={submittingCoupon}>
                  {submittingCoupon ? 'Creating Coupon...' : 'Generate Promo Coupon'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Business Dashboard Analytics */}
          {activeTab === 'analytics' && analytics && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Core metrics counters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '24px' }}>💵</span>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0' }}>Total Revenues</p>
                  <h4 style={{ fontSize: '22px', color: 'var(--accent-cyan)' }}>${analytics.totalRevenue.toFixed(2)}</h4>
                </div>
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '24px' }}>🧳</span>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0' }}>Bookings count</p>
                  <h4 style={{ fontSize: '22px' }}>{analytics.totalBookings}</h4>
                </div>
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '24px' }}>🔑</span>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0' }}>Total Rooms</p>
                  <h4 style={{ fontSize: '22px' }}>{analytics.totalRooms}</h4>
                </div>
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '24px' }}>👥</span>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0' }}>Total Profiles</p>
                  <h4 style={{ fontSize: '22px' }}>{analytics.totalUsers}</h4>
                </div>
              </div>

              {/* Occupancy stats panel */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
                  📈 Dashboard Occupancy Rate
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '12px' }}>
                  <div 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '50%', 
                      border: '4px solid var(--accent-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--text-active)'
                    }}
                  >
                    {analytics.averageOccupancyRate.toFixed(1)}%
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px' }}>Current Occupancy average</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Revenues fluctuate based on season. Apply SUMMER50 or WELCOME10 coupon promotions to spike occupancy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
