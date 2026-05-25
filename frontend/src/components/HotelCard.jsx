import React from 'react';
import { Link } from 'react-router-dom';

const HotelCard = ({ hotel }) => {
  // Safe helper to pick mock background image based on hotel ID
  const getHotelImage = (id) => {
    const images = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80'
    ];
    return images[(id - 1) % images.length] || images[0];
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Hotel Visual Cover */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <img 
          src={getHotelImage(hotel.id)} 
          alt={hotel.hotelName} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition-smooth)' }}
          className="hotel-img"
        />
        <div 
          style={{ 
            position: 'absolute', 
            top: '12px', 
            right: '12px', 
            background: 'rgba(15, 17, 26, 0.85)',
            backdropFilter: 'blur(4px)',
            border: '1px solid var(--border-glass)',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--accent-gold)'
          }}
        >
          ★ {hotel.rating.toFixed(1)}
        </div>
      </div>

      {/* Hotel Contents */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '10px', textAlign: 'left' }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
            {hotel.city}
          </span>
          <h3 style={{ fontSize: '20px', margin: '2px 0 6px 0', lineHeight: '1.2' }}>{hotel.hotelName}</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📍 {hotel.address}</p>
        </div>

        <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '4px 0' }}>
          {hotel.description}
        </p>

        {/* Amenities Icons Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '6px 0 12px 0' }}>
          {hotel.amenities?.slice(0, 3).map((amenity, i) => (
            <span 
              key={i} 
              className="glass-panel"
              style={{ 
                fontSize: '11px', 
                padding: '4px 8px', 
                borderRadius: '8px', 
                color: 'var(--text-muted)',
                background: 'rgba(255,255,255,0.02)'
              }}
            >
              {amenity}
            </span>
          ))}
          {hotel.amenities?.length > 3 && (
            <span style={{ fontSize: '11px', padding: '4px 6px', color: 'var(--text-muted)' }}>
              +{hotel.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Action button */}
        <div style={{ marginTop: 'auto' }}>
          <Link 
            to={`/hotel/${hotel.id}`} 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px' }}
          >
            Explore Rooms & Book
          </Link>
        </div>
      </div>

      <style>{`
        .hotel-img:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default HotelCard;
