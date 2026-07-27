import React, { useState } from 'react';
import { Search, Filter, Calendar, User, Phone, Mail, Send, Eye, Trash2 } from 'lucide-react';

export default function EnquiriesTable({ enquiries, rooms, onUpdateStage, onOpenSyncModal, onOpenDetailModal, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  const filtered = enquiries.filter(app => {
    const matchesSearch = searchTerm === '' ||
      `${app.child_first_name} ${app.child_last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.parent_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = selectedStage === '' || app.stage === selectedStage;
    const matchesRoom = selectedRoom === '' || String(app.room_id) === String(selectedRoom);

    return matchesSearch && matchesStage && matchesRoom;
  });

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Table Filters & Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search child, parent or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              className="select-field"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              style={{ width: '160px' }}
            >
              <option value="">All Stages</option>
              <option value="interest_captured">Interest Captured</option>
              <option value="classified">Room Classified</option>
              <option value="waiting_list">Waiting List</option>
              <option value="offer_sent">Offer Sent</option>
              <option value="deposit_pending">Deposit Pending</option>
              <option value="confirmed">Confirmed</option>
            </select>

            <select
              className="select-field"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              style={{ width: '170px' }}
            >
              <option value="">All Rooms</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{filtered.length}</strong> of <strong>{enquiries.length}</strong> prospective children
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 16px' }}>Child Details</th>
              <th style={{ padding: '12px 16px' }}>Requested Start</th>
              <th style={{ padding: '12px 16px' }}>Parent / Guardian</th>
              <th style={{ padding: '12px 16px' }}>Assigned Room</th>
              <th style={{ padding: '12px 16px' }}>Pipeline Stage</th>
              <th style={{ padding: '12px 16px' }}>Deposit</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No matching enquiries found.
                </td>
              </tr>
            ) : (
              filtered.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s' }}>
                  {/* Child */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
                      {app.child_first_name} {app.child_last_name}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      DOB: {app.date_of_birth} {Boolean(app.sibling_priority) && '• Sibling Priority'}
                    </div>
                  </td>

                  {/* Start date */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <Calendar size={14} color="#818cf8" />
                      {app.requested_start_date}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {app.days_requested}
                    </div>
                  </td>

                  {/* Parent */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.parent_name}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Mail size={12} /> {app.parent_email}
                    </div>
                  </td>

                  {/* Room */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: '#22d3ee',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.775rem',
                      fontWeight: 600
                    }}>
                      {app.room_name || 'Unassigned'}
                    </span>
                  </td>

                  {/* Stage Dropdown */}
                  <td style={{ padding: '14px 16px' }}>
                    <select
                      className={`select-field badge badge-${app.stage}`}
                      value={app.stage}
                      onChange={(e) => onUpdateStage(app.id, e.target.value)}
                      style={{ cursor: 'pointer', border: '1px solid var(--border-color)' }}
                    >
                      <option value="interest_captured">Interest Captured</option>
                      <option value="classified">Room Classified</option>
                      <option value="waiting_list">Waiting List</option>
                      <option value="offer_sent">Offer Sent</option>
                      <option value="deposit_pending">Deposit Pending</option>
                      <option value="confirmed">Confirmed</option>
                    </select>
                  </td>

                  {/* Deposit */}
                  <td style={{ padding: '14px 16px' }}>
                    {Boolean(app.deposit_paid) ? (
                      <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.825rem' }}>
                        Paid (€{app.deposit_amount ? app.deposit_amount.toFixed(2) : '150.00'})
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                        Unpaid (€0)
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => onOpenDetailModal(app)} title="View full details">
                        <Eye size={14} />
                      </button>

                      <button className="btn btn-success btn-sm" onClick={() => onOpenSyncModal(app)} title="Export to Famly / TeachKloud / Child Paths">
                        <Send size={13} /> Sync API
                      </button>

                      <button className="btn btn-secondary btn-sm" onClick={() => onDelete(app.id)} style={{ color: '#f43f5e' }} title="Delete application">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
