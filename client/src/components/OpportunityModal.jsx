import React, { useState, useEffect } from 'react';
import { X, Award, ShieldCheck, Calendar, ArrowRight, UserCheck } from 'lucide-react';

export default function OpportunityModal({ room, onClose, onRefreshData }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    if (room?.id) {
      setLoading(true);
      fetch(`/api/enquiries?room_id=${room.id}`)
        .then(res => res.json())
        .then(data => {
          setLoading(false);
          if (data.success && data.data) {
            // Filter candidates in pre-offer stages (interest_captured, classified, waiting_list)
            const filtered = data.data.filter(app =>
              ['interest_captured', 'classified', 'waiting_list'].includes(app.stage)
            );

            // Sort logic (Workflow 3):
            // 1. Sibling Priority (true first)
            // 2. FIFO (created_at ascending, oldest first)
            const sorted = filtered.sort((a, b) => {
              if (a.sibling_priority && !b.sibling_priority) return -1;
              if (!a.sibling_priority && b.sibling_priority) return 1;
              return new Date(a.created_at) - new Date(b.created_at);
            });

            setCandidates(sorted);
          }
        })
        .catch(() => setLoading(false));
    }
  }, [room]);

  const handleOfferPlace = (appId) => {
    setActioningId(appId);
    // Move stage to 'offer_sent' (Workflow 4)
    fetch(`/api/enquiries/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: 'offer_sent' })
    })
      .then(res => res.json())
      .then(data => {
        setActioningId(null);
        if (data.success) {
          // Auto create a follow-up task on client or let server handle
          // In server db.js we will add a hook to auto-create this task
          // Refresh parent list and room capacity data
          onRefreshData();
          onClose();
        }
      })
      .catch(() => setActioningId(null));
  };

  if (!room) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="#f59e0b" /> Vacancy Opportunity Allocator
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Select candidate to fill vacancy in <strong style={{ color: 'var(--accent-cyan)' }}>{room.name}</strong> (Available Places: {room.available_places})
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Retrieving waiting list candidates...
          </div>
        ) : candidates.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>No candidates found on the waiting list.</p>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              There are currently no children with pre-offer status classified for this room.
            </p>
          </div>
        ) : (
          <div>
            {/* Regulatory rules context */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.15)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              fontSize: '0.8rem',
              color: '#fbbf24',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <InfoIcon size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>Allocation Algorithm Active:</strong> Candidates are automatically ranked using the crèche priority scheme. Sibling priority is placed first, followed by historical date of registration (FIFO).
              </div>
            </div>

            {/* Candidate List Table */}
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(15, 23, 42, 0.3)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Rank</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Child</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Requested Start</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Priority</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Registered</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((app, index) => (
                    <tr key={app.id} style={{
                      borderBottom: index < candidates.length - 1 ? '1px solid var(--border-color)' : 'none',
                      background: app.sibling_priority ? 'rgba(245, 158, 11, 0.03)' : 'transparent',
                      transition: 'background 0.2s'
                    }}>
                      {/* Rank */}
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: index === 0 ? '#fbbf24' : 'var(--text-muted)' }}>
                        #{index + 1}
                      </td>
                      {/* Child Name & DOB */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{app.child_first_name} {app.child_last_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DOB: {app.date_of_birth}</div>
                      </td>
                      {/* Start Date */}
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        {app.requested_start_date}
                      </td>
                      {/* Sibling Priority */}
                      <td style={{ padding: '14px 16px' }}>
                        {app.sibling_priority ? (
                          <span style={{
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700
                          }}>
                            Sibling (High)
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Standard</span>
                        )}
                      </td>
                      {/* Registration Date */}
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      {/* Action */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOfferPlace(app.id)}
                          disabled={actioningId !== null}
                          className="btn btn-primary btn-sm"
                          style={{
                            background: index === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'var(--primary)',
                            border: 'none',
                            color: '#000',
                            fontWeight: 700
                          }}
                        >
                          {actioningId === app.id ? 'Processing...' : (
                            <>
                              Offer Place <ArrowRight size={12} />
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline simple SVG icon for Info to avoid Lucide import issues if not found
function InfoIcon({ size, style }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 16}
      height={size || 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
