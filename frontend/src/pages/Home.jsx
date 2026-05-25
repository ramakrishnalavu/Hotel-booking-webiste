import React, { useState, useEffect } from 'react';
import api from '../services/api';
import HotelCard from '../components/HotelCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { bookingState, setBookingState, showToast } = useAuth();
  
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [city, setCity] = useState('');
  const [minRating, setMinRating] = useState('0.0');
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Date selection states prefilled from context or defaulting to tomorrow/day-after
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterStr = dayAfter.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(bookingState.checkIn || tomorrowStr);
  const [checkOut, setCheckOut] = useState(bookingState.checkOut || dayAfterStr);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const amenitiesList = [
    'Free WiFi',
    'Swimming Pool',
    'Spa & Wellness',
    'Fitness Center',
    'Free Parking',
    'Room Service',
    'Complimentary Breakfast'
  ];

  const fetchHotels = async () => {
    setLoading(true);
    try {
      // Query parameters for search query API
      const response = await api.get('/api/hotels', {
        params: {
          city: city.trim() || undefined,
          minRating: parseFloat(minRating) || 0.0
        }
      });
      setHotels(response.data);
      setCurrentPage(1); // Reset to first page on new query search
    } catch (error) {
      showToast('Error loading hotel list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (checkIn && checkOut) {
      if (checkIn < todayStr) {
        showToast('Check-in date cannot be in the past!', 'warning');
        return;
      }
      if (checkOut <= checkIn) {
        showToast('Check-out date must be after check-in!', 'warning');
        return;
      }
      
      // Save selected dates globally to Context
      setBookingState((prev) => ({
        ...prev,
        checkIn: checkIn,
        checkOut: checkOut
      }));
    }
    fetchHotels();
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) => 
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
    setCurrentPage(1);
  };

  // Filter hotels based on selected amenities
  const filteredHotels = hotels.filter((hotel) => {
    if (selectedAmenities.length === 0) return true;
    return selectedAmenities.every((amenity) => 
      hotel.amenities?.some((a) => a.toLowerCase() === amenity.toLowerCase())
    );
  });

  // Paginated hotels math
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHotels = filteredHotels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {/* Hero Showcase Section */}
      <div 
        className="glass-panel flex-center"
        style={{
          flexDirection: 'column',
          padding: '60px 24px',
          backgroundImage: 'linear-gradient(rgba(248, 250, 252, 0.8), rgba(248, 250, 252, 0.95)), url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid var(--border-glass)',
          marginBottom: '32px'
        }}
      >
        <span className="badge badge-role" style={{ marginBottom: '12px' }}>Luxury Escapes await</span>
        <h1 style={{ fontSize: '44px', margin: '0 0 12px 0', lineHeight: '1.1' }} className="gradient-text">
          Find Your Nebula Sanctuary
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '600px', margin: '0 auto 24px auto' }}>
          Explore modern glassmorphic retreats and book fully automated suites with loyalty rewards.
        </p>

        {/* Global Search Controller Card */}
        <form 
          onSubmit={handleSearchSubmit}
          className="glass-panel"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            padding: '20px',
            width: '100%',
            maxWidth: '920px',
            background: 'var(--bg-glass-card)',
            alignItems: 'flex-end'
          }}
        >
          {/* City field */}
          <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label className="form-label">Destination City</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. New York, Miami"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* Check-In Date field */}
          <div className="form-group" style={{ flex: '1 1 160px', marginBottom: 0 }}>
            <label className="form-label">Check In Date</label>
            <input 
              type="date" 
              min={todayStr}
              className="form-input" 
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>

          {/* Check-Out Date field */}
          <div className="form-group" style={{ flex: '1 1 160px', marginBottom: 0 }}>
            <label className="form-label">Check Out Date</label>
            <input 
              type="date" 
              min={checkIn || todayStr}
              className="form-input" 
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>

          {/* Rating field */}
          <div className="form-group" style={{ flex: '1 1 140px', marginBottom: 0 }}>
            <label className="form-label">Minimum Star Rating</label>
            <select 
              className="form-input"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              style={{ background: 'var(--bg-secondary)', cursor: 'pointer' }}
            >
              <option value="0.0">All Ratings</option>
              <option value="4.0">★ 4.0 & Up</option>
              <option value="4.5">★ 4.5 & Up</option>
              <option value="4.8">★ 4.8 & Up</option>
            </select>
          </div>

          <button type="submit" className="btn btn-accent" style={{ padding: '12px 24px', flex: '1 1 120px' }}>
            Search Now
          </button>
        </form>
      </div>

      {/* Main Catalog grid */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left Side Amenities Filter Drawer */}
        <div className="glass-panel" style={{ width: '280px', padding: '24px', flexShrink: 0, textAlign: 'left' }}>
          <h4 style={{ fontSize: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
            Filter Amenities
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {amenitiesList.map((amenity, i) => {
              const isChecked = selectedAmenities.includes(amenity);
              return (
                <label 
                  key={i} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    cursor: 'pointer',
                    fontSize: '14.5px',
                    color: isChecked ? 'var(--accent-cyan)' : 'var(--text-primary)',
                    fontWeight: isChecked ? 600 : 400
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={() => toggleAmenity(amenity)}
                    style={{
                      accentColor: 'var(--accent-cyan)',
                      width: '16px',
                      height: '16px'
                    }}
                  />
                  <span>{amenity}</span>
                </label>
              );
            })}
          </div>

          {selectedAmenities.length > 0 && (
            <button 
              onClick={() => setSelectedAmenities([])} 
              className="btn btn-secondary" 
              style={{ width: '100%', padding: '8px', fontSize: '12px', marginTop: '16px' }}
            >
              Clear Active Filters
            </button>
          )}
        </div>

        {/* Right Side Cards Area */}
        <div style={{ flexGrow: 1, flexBasis: '500px' }}>
          {loading ? (
            <SkeletonLoader count={6} />
          ) : currentHotels.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📭</span>
              <h3>No Sanctuary Found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
                We couldn't find any hotels matching your query. Try broadening your criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="hotel-grid">
                {currentHotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>

              {/* Dynamic Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex-center" style={{ gap: '12px', marginTop: '40px' }}>
                  <button 
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', minWidth: '80px' }}
                  >
                    Prev
                  </button>
                  <span style={{ fontSize: '14.5px', color: 'var(--text-muted)' }}>
                    Page <strong style={{ color: 'var(--text-active)' }}>{currentPage}</strong> of <strong>{totalPages}</strong>
                  </span>
                  <button 
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', minWidth: '80px' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
