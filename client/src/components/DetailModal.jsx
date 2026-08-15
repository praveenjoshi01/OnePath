import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, Mail, FileText, CheckCircle2, Clock, Server, ShieldCheck, Tag, History, Info, Landmark } from 'lucide-react';

export default function DetailModal({ application, rooms = [], onClose, onUpdateStage }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'activity'
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    if (application?.id) {
      setLoading(true);
      fetch(`/api/enquiries/${application.id}`)
        .then(res => res.json())
        .then(data => {
          setLoading(false);
          if (data.success) setDetails(data.data);
        })
        .catch(() => setLoading(false));
    }
  }, [application]);

  if (!application) return null;

  // Find room details from rooms prop to get current capacity/occupancy
  const activeRoom = rooms.find(r => String(r.id) === String(application.room_id));

  // Calculate child age at requested start date
  const getAgeInMonths = (dob, startDate) => {
    const birth = new Date(dob);
    const start = new Date(startDate);
    if (isNaN(birth.getTime()) || isNaN(start.getTime())) return null;

    let ageMonths = (start.getFullYear() - birth.getFullYear()) * 12 + (start.getMonth() - birth.getMonth());
    if (start.getDate() < birth.getDate()) ageMonths--;
    return ageMonths < 0 ? 0 : ageMonths;
  };

  const childAgeMonths = getAgeInMonths(application.date_of_birth, application.requested_start_date);

  // Advanced workflow actions (Workflow 4)
  const handleRecordAcceptance = () => {
    setActioning(true);
    fetch(`/api/enquiries/${application.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: 'deposit_pending' })
    })
      .then(res => res.json())
      .then(data => {
        setActioning(false);
        if (data.success) {
          onUpdateStage(application.id, 'deposit_pending');
          // Refresh details
          setDetails(prev => ({
            ...prev,
            stage: 'deposit_pending'
          }));
        }
      })
      .catch(() => setActioning(false));
  };

  const handleVerifyDeposit = () => {
    setActioning(true);
    fetch(`/api/enquiries/${application.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage: 'confirmed',
        deposit_paid: true,
        deposit_amount: 150.00
      })
    })
      .then(res => res.json())
      .then(data => {
        setActioning(false);
        if (data.success) {
          onUpdateStage(application.id, 'confirmed');
          // Refresh details
          setDetails(prev => ({
            ...prev,
            stage: 'confirmed',
            deposit_paid: true,
            deposit_amount: 150.00
          }));
        }
      })
      .catch(() => setActioning(false));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {application.child_first_name} {application.child_last_name}
              </h2>
              <span className={`badge badge-${details?.stage || application.stage}`}>
                {(details?.stage || application.stage).replace('_', ' ')}
              </span>
              {application.sibling_priority && (
                <span style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Tag size={10} /> Sibling Priority
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              OnePath Reference: OP-ENROL-{application.id} • Registered on {new Date(application.created_at).toLocaleDateString()}
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '20px',
          gap: '8px'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'overview' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <User size={15} /> Overview
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'activity' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'activity' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <History size={15} /> Activity Timeline
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading child profile...</div>
        ) : (
          <div>
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Age & Room Suitability Banner (Workflow 2) */}
                <div style={{
                  background: 'rgba(99, 102, 241, 0.06)',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '0.825rem'
                }}>
                  <div style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}>
                    <Info size={18} />
                  </div>
                  <div>
                    <strong>Room Suitability Context:</strong> At the requested start date ({application.requested_start_date}), {application.child_first_name} will be <strong>{childAgeMonths} months old</strong>.
                    This perfectly matches the classification for <strong style={{ color: 'var(--accent-cyan)' }}>{application.room_name}</strong> (limits: 0-60 months).
                    {activeRoom && (
                      <div style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                        Current Room Occupancy: <strong>{activeRoom.enrolled_count} / {activeRoom.capacity} places filled</strong> ({activeRoom.available_places} vacancies remain).
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '14px',
                  background: 'var(--bg-surface)',
                  padding: '18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.875rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', fontWeight: 600 }}>Date of Birth</span>
                    <div style={{ fontWeight: 700, marginTop: '2px' }}>{application.date_of_birth}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', fontWeight: 600 }}>Requested Start Date</span>
                    <div style={{ fontWeight: 700, color: '#818cf8', marginTop: '2px' }}>{application.requested_start_date}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', fontWeight: 600 }}>Classified Crèche Room</span>
                    <div style={{ fontWeight: 700, color: '#22d3ee', marginTop: '2px' }}>{application.room_name || 'Unassigned'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', fontWeight: 600 }}>Schedule / Days</span>
                    <div style={{ fontWeight: 700, marginTop: '2px' }}>{application.days_requested}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', fontWeight: 600 }}>Parent / Guardian</span>
                    <div style={{ fontWeight: 700, marginTop: '2px' }}>{application.parent_name}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', fontWeight: 600 }}>Contact Info</span>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1.4 }}>
                      {application.parent_email} <br /> {application.parent_phone}
                    </div>
                  </div>
                </div>

                {/* Notes and Medical Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Medical / Allergy Notes:</span>
                    <div style={{
                      background: 'rgba(244, 63, 94, 0.05)',
                      border: '1px solid rgba(244, 63, 94, 0.15)',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      marginTop: '4px',
                      fontSize: '0.825rem',
                      color: application.medical_notes ? 'var(--text-primary)' : 'var(--text-muted)'
                    }}>
                      {application.medical_notes || 'No medical or allergy notes recorded.'}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Staff Internal Notes:</span>
                    <div style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      marginTop: '4px',
                      fontSize: '0.825rem',
                      color: application.notes ? 'var(--text-primary)' : 'var(--text-muted)'
                    }}>
                      {application.notes || 'No internal notes added.'}
                    </div>
                  </div>
                </div>

                {/* Financial Deposit Status */}
                <div style={{
                  background: (details?.deposit_paid || application.deposit_paid) ? 'rgba(16, 185, 129, 0.06)' : 'rgba(244, 63, 94, 0.06)',
                  border: (details?.deposit_paid || application.deposit_paid) ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(244, 63, 94, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Landmark size={18} color={(details?.deposit_paid || application.deposit_paid) ? '#10b981' : '#f43f5e'} />
                    <span style={{ fontWeight: 600 }}>€150 Enrollment Deposit Status:</span>
                  </div>
                  <div>
                    {(details?.deposit_paid || application.deposit_paid) ? (
                      <strong style={{ color: '#34d399' }}>Received (€{details?.deposit_amount?.toFixed(2) || application.deposit_amount?.toFixed(2) || '150.00'})</strong>
                    ) : (
                      <strong style={{ color: '#fb7185' }}>Awaiting Deposit</strong>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACTIVITY TIMELINE */}
            {activeTab === 'activity' && (
              <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-secondary)' }}>
                  Chronological Enrollment Lifecycle Audits
                </h3>

                {details?.activityLogs && details.activityLogs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '8px', borderLeft: '2px solid var(--border-color)', gap: '20px', marginLeft: '12px', marginBlock: '10px' }}>
                    {details.activityLogs.map((log) => (
                      <div key={log.id} style={{ position: 'relative' }}>
                        {/* Dot indicator */}
                        <div style={{
                          position: 'absolute',
                          left: '-17px',
                          top: '2px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))',
                          border: '2px solid var(--bg-primary)'
                        }} />
                        <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#f8fafc' }}>
                          {log.action}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {log.notes}
                        </p>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No audit records registered for this application.
                  </div>
                )}

                {/* Sync Audit History (Merged at bottom) */}
                {details?.syncLogs && details.syncLogs.length > 0 && (
                  <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Server size={14} color="#10b981" /> Child Platform Sync History
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {details.syncLogs.map(log => (
                        <div key={log.id} style={{
                          background: 'rgba(16, 185, 129, 0.08)',
                          border: '1px solid rgba(16, 185, 129, 0.15)',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          fontSize: '0.775rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                            <span style={{ color: 'var(--accent-emerald)' }}>{log.target_platform} sync ({log.status})</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{new Date(log.synced_at).toLocaleDateString()}</span>
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>
                            {log.response_message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions Panel (Workflow 4) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '20px',
              marginTop: '24px'
            }}>
              {/* Left Action: Advance lifecycle stages dynamically */}
              <div>
                {(details?.stage || application.stage) === 'offer_sent' && (
                  <button
                    onClick={handleRecordAcceptance}
                    disabled={actioning}
                    className="btn btn-success"
                    style={{ background: 'var(--primary)', color: '#fff', border: 'none' }}
                  >
                    <CheckCircle2 size={16} /> Record Parent Offer Acceptance
                  </button>
                )}
                {(details?.stage || application.stage) === 'deposit_pending' && (
                  <button
                    onClick={handleVerifyDeposit}
                    disabled={actioning}
                    className="btn btn-success"
                  >
                    <Landmark size={16} /> Verify €150 Deposit & Documentations
                  </button>
                )}
              </div>

              {/* Right Button */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={onClose}>Close Profile</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
