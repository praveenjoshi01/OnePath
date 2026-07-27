import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export default function NewEnquiryModal({ rooms, onClose, onSubmit }) {
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [dob, setDob] = useState('2025-06-01');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [source, setSource] = useState('Website');
  const [roomId, setRoomId] = useState('');
  const [daysRequested, setDaysRequested] = useState('Full-time (5 Days)');
  const [siblingPriority, setSiblingPriority] = useState(false);
  const [medicalNotes, setMedicalNotes] = useState('');
  const [notes, setNotes] = useState('');

  const [suggestedRoomInfo, setSuggestedRoomInfo] = useState(null);

  // Auto-suggest room when DOB or start date changes
  useEffect(() => {
    if (dob && startDate) {
      fetch('/api/enquiries/suggest-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date_of_birth: dob, requested_start_date: startDate })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setSuggestedRoomInfo(data.data);
            if (data.data.suggestedRoom) {
              setRoomId(data.data.suggestedRoom.id);
            }
          }
        })
        .catch(err => console.error('Error suggesting room:', err));
    }
  }, [dob, startDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!childFirstName || !childLastName || !parentName || !parentEmail) return;

    onSubmit({
      child_first_name: childFirstName,
      child_last_name: childLastName,
      date_of_birth: dob,
      requested_start_date: startDate,
      parent_name: parentName,
      parent_email: parentEmail,
      parent_phone: parentPhone,
      enquiry_source: source,
      room_id: Number(roomId) || null,
      days_requested: daysRequested,
      sibling_priority: siblingPriority ? 1 : 0,
      medical_notes: medicalNotes,
      notes: notes
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Capture Prospective Child Enquiry</h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Add a new family to the pre-enrolment pipeline & waiting list
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Child Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Child First Name *</label>
              <input type="text" className="input-field" required value={childFirstName} onChange={(e) => setChildFirstName(e.target.value)} placeholder="e.g. Conor" />
            </div>
            <div className="input-group">
              <label className="input-label">Child Last Name *</label>
              <input type="text" className="input-field" required value={childLastName} onChange={(e) => setChildLastName(e.target.value)} placeholder="e.g. Kelly" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Date of Birth *</label>
              <input type="date" className="input-field" required value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Requested Start Date *</label>
              <input type="date" className="input-field" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>

          {/* Room Auto-Classification Banner */}
          {suggestedRoomInfo?.suggestedRoom && (
            <div style={{
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.825rem'
            }}>
              <Sparkles size={18} color="#818cf8" />
              <div>
                <strong>Auto-Classification Recommendation:</strong> Child will be <strong>{suggestedRoomInfo.ageMonths} months old</strong> at start date.
                Assigned room: <strong style={{ color: '#22d3ee' }}>{suggestedRoomInfo.suggestedRoom.name}</strong>.
              </div>
            </div>
          )}

          {/* Parent Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Parent / Guardian Name *</label>
              <input type="text" className="input-field" required value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="e.g. Mary Kelly" />
            </div>
            <div className="input-group">
              <label className="input-label">Parent Email *</label>
              <input type="email" className="input-field" required value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="e.g. mary.k@example.ie" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input type="text" className="input-field" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="+353 87 000 0000" />
            </div>
            <div className="input-group">
              <label className="input-label">Enquiry Source Channel</label>
              <select className="select-field" value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="Website">Website Form</option>
                <option value="Email">Direct Email</option>
                <option value="Phone">Phone Enquiry</option>
                <option value="Referral">Family Referral</option>
                <option value="Walk-in">Crèche Walk-in</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Assigned Room</label>
              <select className="select-field" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.staff_ratio})</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Days / Schedule Requested</label>
              <input type="text" className="input-field" value={daysRequested} onChange={(e) => setDaysRequested(e.target.value)} placeholder="Full-time (5 Days) or 3 Days" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <input type="checkbox" id="siblingPriority" checked={siblingPriority} onChange={(e) => setSiblingPriority(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
            <label htmlFor="siblingPriority" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              Sibling Priority (Has older sibling currently enrolled)
            </label>
          </div>

          <div className="input-group">
            <label className="input-label">Medical / Dietary Notes</label>
            <input type="text" className="input-field" value={medicalNotes} onChange={(e) => setMedicalNotes(e.target.value)} placeholder="Allergies, medical conditions, special care" />
          </div>

          <div className="input-group">
            <label className="input-label">Internal Notes / Enquiry Details</label>
            <textarea className="textarea-field" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Initial conversation notes, parent preferences..." />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save & Classify Enquiry</button>
          </div>
        </form>
      </div>
    </div>
  );
}
