import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Server, Code, FileJson } from 'lucide-react';

const TARGET_PLATFORMS = ['Famly', 'TeachKloud', 'Child Paths', 'EYCEsoft', 'Tot Tracker', 'Little Vista'];

export default function SyncModal({ application, onClose, onExportSuccess }) {
  const [selectedVendor, setSelectedVendor] = useState('Famly');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const previewPayload = {
    onepath_reference_id: `OP-ENROL-${application.id}`,
    export_timestamp: new Date().toISOString(),
    destination_platform: selectedVendor,
    child_details: {
      first_name: application.child_first_name,
      last_name: application.child_last_name,
      date_of_birth: application.date_of_birth,
      requested_start_date: application.requested_start_date,
      assigned_room: application.room_name || 'Unassigned',
      days_requested: application.days_requested,
      medical_notes: application.medical_notes || 'None'
    },
    guardian_details: {
      full_name: application.parent_name,
      email: application.parent_email,
      phone: application.parent_phone
    },
    financial_status: {
      deposit_paid: Boolean(application.deposit_paid),
      deposit_amount_eur: application.deposit_amount || 150.00
    },
    onepath_audit: {
      enquiry_source: application.enquiry_source,
      enrolled_at: application.created_at,
      sibling_priority: Boolean(application.sibling_priority)
    }
  };

  const handleExport = () => {
    setLoading(true);
    setError(null);
    setResult(null);

    fetch('/api/sync/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: application.id,
        target_platform: selectedVendor
      })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          setResult(data);
          onExportSuccess();
        } else {
          setError(data.error || 'Failed to export child record');
        }
      })
      .catch(err => {
        setLoading(false);
        setError(err.message);
      });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Server size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Vendor-Neutral Integration & API Handoff</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Export approved prospective child record to active childcare management platform
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Vendor Selector */}
        <div style={{ marginBottom: '18px' }}>
          <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>Target Destination Platform</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {TARGET_PLATFORMS.map(vendor => (
              <button
                key={vendor}
                type="button"
                className={`btn ${selectedVendor === vendor ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedVendor(vendor)}
                style={{ justifyContent: 'center', fontSize: '0.825rem' }}
              >
                {vendor}
              </button>
            ))}
          </div>
        </div>

        {/* Payload Preview */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileJson size={14} color="#818cf8" /> OnePath Standardized API Payload Preview
            </span>
            <span style={{ fontSize: '0.725rem', color: '#34d399', fontWeight: 600 }}>Validated JSON Format</span>
          </div>

          <pre style={{
            background: '#090d16',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            fontSize: '0.775rem',
            color: '#a5b4fc',
            maxHeight: '220px',
            overflowY: 'auto',
            lineHeight: 1.4
          }}>
            {JSON.stringify(previewPayload, null, 2)}
          </pre>
        </div>

        {/* Status result */}
        {result && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginBottom: '18px',
            color: '#34d399',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '0.85rem'
          }}>
            <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Sync Completed Successfully!</strong>
              <div style={{ marginTop: '2px', fontSize: '0.8rem', color: '#a7f3d0' }}>
                {result.message}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginBottom: '18px',
            color: '#fb7185',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={20} />
            <div>{error}</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button
            className="btn btn-success"
            onClick={handleExport}
            disabled={loading}
          >
            <Send size={16} />
            {loading ? 'Transmitting API Payload...' : `Export & Sync to ${selectedVendor}`}
          </button>
        </div>
      </div>
    </div>
  );
}
