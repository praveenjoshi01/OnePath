import React from 'react';
import { ChevronRight, ChevronLeft, Calendar, User, Phone, Send, CheckCircle, AlertTriangle, ShieldCheck, Tag } from 'lucide-react';

const STAGES = [
  { key: 'interest_captured', label: '1. Interest Captured', color: '#6366f1' },
  { key: 'classified', label: '2. Room Classified', color: '#06b6d4' },
  { key: 'waiting_list', label: '3. Waiting List', color: '#f59e0b' },
  { key: 'offer_sent', label: '4. Offer Sent', color: '#a855f7' },
  { key: 'deposit_pending', label: '5. Deposit Pending', color: '#f43f5e' },
  { key: 'confirmed', label: '6. Confirmed & Handoff', color: '#10b981' },
];

export default function PipelineKanban({ enquiries, onUpdateStage, onOpenSyncModal, onOpenDetailModal }) {
  // Group enquiries by stage
  const grouped = STAGES.reduce((acc, stage) => {
    acc[stage.key] = enquiries.filter(app => app.stage === stage.key);
    return acc;
  }, {});

  const getNextStage = (currentStage) => {
    const idx = STAGES.findIndex(s => s.key === currentStage);
    if (idx >= 0 && idx < STAGES.length - 1) return STAGES[idx + 1].key;
    return null;
  };

  const getPrevStage = (currentStage) => {
    const idx = STAGES.findIndex(s => s.key === currentStage);
    if (idx > 0) return STAGES[idx - 1].key;
    return null;
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(6, minmax(270px, 1fr))',
      gap: '16px',
      overflowX: 'auto',
      paddingBottom: '16px'
    }}>
      {STAGES.map((stage) => {
        const apps = grouped[stage.key] || [];
        return (
          <div key={stage.key} className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '75vh',
            background: 'rgba(30, 41, 59, 0.4)'
          }}>
            {/* Column Header */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.4)',
              borderTopLeftRadius: 'var(--radius-lg)',
              borderTopRightRadius: 'var(--radius-lg)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: stage.color }} />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>{stage.label}</h3>
              </div>
              <span style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-secondary)'
              }}>
                {apps.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div style={{
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              overflowY: 'auto',
              flex: 1
            }}>
              {apps.length === 0 ? (
                <div style={{
                  padding: '30px 10px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  No applications in this stage
                </div>
              ) : (
                apps.map((app) => (
                  <div key={app.id} style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }} className="kanban-card">
                    {/* Header: Child Name & Sibling Priority */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div 
                        onClick={() => onOpenDetailModal(app)}
                        style={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.975rem', color: '#f8fafc' }}
                      >
                        {app.child_first_name} {app.child_last_name}
                      </div>
                      {Boolean(app.sibling_priority) && (
                        <span style={{
                          background: 'rgba(245, 158, 11, 0.2)',
                          color: '#fbbf24',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '0.675rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }} title="Sibling in Crèche Priority">
                          <Tag size={10} /> Sibling
                        </span>
                      )}
                    </div>

                    {/* Room Badge */}
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(6, 182, 212, 0.12)',
                        color: '#22d3ee',
                        border: '1px solid rgba(6, 182, 212, 0.25)',
                        fontWeight: 600,
                        display: 'inline-block'
                      }}>
                        {app.room_name || 'Room Unassigned'}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} color="var(--text-muted)" />
                        Start: <strong style={{ color: '#e2e8f0' }}>{app.requested_start_date}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} color="var(--text-muted)" />
                        Parent: {app.parent_name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} color="var(--text-muted)" />
                        {app.parent_phone || 'No phone'}
                      </div>
                    </div>

                    {/* Deposit info if deposit pending or confirmed */}
                    {Boolean(app.deposit_paid) && (
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.725rem',
                        color: '#34d399',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}>
                        <span>Deposit Paid:</span>
                        <strong>€{app.deposit_amount ? app.deposit_amount.toFixed(2) : '150.00'}</strong>
                      </div>
                    )}

                    {/* Card Actions Footer */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '8px',
                      marginTop: '4px'
                    }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {getPrevStage(app.stage) && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px' }}
                            onClick={() => onUpdateStage(app.id, getPrevStage(app.stage))}
                            title="Move back a stage"
                          >
                            <ChevronLeft size={14} />
                          </button>
                        )}
                        {getNextStage(app.stage) && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px' }}
                            onClick={() => onUpdateStage(app.id, getNextStage(app.stage))}
                            title="Advance to next stage"
                          >
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>

                      {/* Sync to Platform Action Button */}
                      {(app.stage === 'confirmed' || app.stage === 'deposit_pending') && (
                        <button
                          className="btn btn-success btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.725rem' }}
                          onClick={() => onOpenSyncModal(app)}
                        >
                          <Send size={12} /> Sync API
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
