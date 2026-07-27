import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, Mail, FileText, CheckCircle2, Clock, Server, ShieldCheck, Tag } from 'lucide-react';

export default function DetailModal({ application, onClose, onUpdateStage }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (application?.id) {
      fetch(`/api/enquiries/${application.id}`)
        .then(res => res.json())
        .then(data => {
          setLoading(false);
          if (data.success) setDetails(data.data);
        })
        .catch(err => setLoading(false));
    }
  }, [application]);

  if (!application) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {application.child_first_name} {application.child_last_name}
              </h2>
              <span className={`badge badge-${application.stage}`}>
                {application.stage.replace('_', ' ')}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              OnePath Reference: OP-ENROL-{application.id} • Enquired on {new Date(application.created_at).toLocaleDateString()}
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading child profile...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Overview Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              background: 'var(--bg-surface)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.875rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.775rem' }}>Date of Birth</span>
                <div style={{ fontWeight: 700 }}>{application.date_of_birth}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.775rem' }}>Requested Start Date</span>
                <div style={{ fontWeight: 700, color: '#818cf8' }}>{application.requested_start_date}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.775rem' }}>Assigned Crèche Room</span>
                <div style={{ fontWeight: 700, color: '#22d3ee' }}>{application.room_name || 'Unassigned'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.775rem' }}>Schedule / Days</span>
                <div style={{ fontWeight: 700 }}>{application.days_requested}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.775rem' }}>Parent / Guardian</span>
                <div style={{ fontWeight: 700 }}>{application.parent_name}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.775rem' }}>Contact Info</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  {application.parent_email}<br />{application.parent_phone}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Medical / Care Notes:</strong>
                <p style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '6px', marginTop: '4px', fontSize: '0.825rem' }}>
                  {application.medical_notes || 'No medical or allergy notes recorded.'}
                </p>
              </div>

              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Staff Internal Notes:</strong>
                <p style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '6px', marginTop: '4px', fontSize: '0.825rem' }}>
                  {application.notes || 'No internal notes added.'}
                </p>
              </div>
            </div>

            {/* Sync Audit History */}
            {details?.syncLogs && details.syncLogs.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Server size={15} color="#34d399" /> Platform API Handoff Audit History
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {details.syncLogs.map(log => (
                    <div key={log.id} style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '0.775rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <strong>{log.target_platform}</strong>: {log.response_message}
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>{log.synced_at}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
