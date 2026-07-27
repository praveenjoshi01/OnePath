import React from 'react';
import { Home, Users, UserCheck, ShieldAlert, Award } from 'lucide-react';

export default function RoomPlanner({ rooms }) {
  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Home size={20} color="#818cf8" /> Crèche Room Occupancy & Future Capacity Monitor
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Real-time Irish early-years room ratios, max capacity limits, and pipeline allocation
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px'
      }}>
        {rooms.map((room) => {
          const occupancyPct = room.occupancy_percentage || 0;
          let progressColor = '#34d399';
          if (occupancyPct >= 85) progressColor = '#fb7185';
          else if (occupancyPct >= 70) progressColor = '#fbbf24';

          return (
            <div key={room.id} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{room.name}</h3>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Age: {room.min_age_months}-{room.max_age_months} Months • Ratio: <strong>{room.staff_ratio}</strong>
                  </div>
                </div>
                <span style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#a5b4fc',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.725rem',
                  fontWeight: 700
                }}>
                  {room.available_places} Places Left
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', marginBottom: '4px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Enrolled / Reserved</span>
                  <span style={{ color: progressColor }}>{room.enrolled_count} / {room.capacity} ({occupancyPct}%)</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${occupancyPct}%`,
                    background: `linear-gradient(to right, ${progressColor}, ${progressColor}dd)`,
                    borderRadius: '9999px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>

              {/* Pipeline waitlist info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.775rem',
                background: 'rgba(15, 23, 42, 0.5)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={13} color="#f59e0b" /> Pipeline Waiting List:
                </span>
                <strong style={{ color: '#fbbf24' }}>{room.pipeline_waitlist_count} Children</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
