import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, User, Calendar, ShieldCheck, Mail, Phone, Info } from 'lucide-react';

const DAYS_OPTIONS = [
  'Full-time (5 Days)',
  '3 Days (Mon, Wed, Fri)',
  '2 Days (Tue, Thu)',
  'ECCE Morning Session',
  'ECCE Full-time (5 Days)'
];

const ENQUIRY_SOURCES = ['Website', 'Email', 'Phone', 'Walk-in', 'Referral'];

export default function ParentEnrollment({ onCloseForm }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    child_first_name: '',
    child_last_name: '',
    date_of_birth: '',
    requested_start_date: '',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    enquiry_source: 'Website',
    days_requested: 'Full-time (5 Days)',
    sibling_priority: false,
    medical_notes: '',
    notes: ''
  });

  const [suggestedRoom, setSuggestedRoom] = useState(null);
  const [ageMonths, setAgeMonths] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Fetch suggested room when DOB or start date changes
  useEffect(() => {
    if (formData.date_of_birth && formData.requested_start_date) {
      setLoadingSuggestion(true);
      fetch('/api/enquiries/suggest-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date_of_birth: formData.date_of_birth,
          requested_start_date: formData.requested_start_date
        })
      })
        .then(res => res.json())
        .then(data => {
          setLoadingSuggestion(false);
          if (data.success && data.data) {
            setSuggestedRoom(data.data.suggestedRoom);
            setAgeMonths(data.data.ageMonths);
          }
        })
        .catch(() => setLoadingSuggestion(false));
    } else {
      setSuggestedRoom(null);
      setAgeMonths(null);
    }
  }, [formData.date_of_birth, formData.requested_start_date]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (step < 4) setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...formData,
      room_id: suggestedRoom ? suggestedRoom.id : null,
      stage: 'interest_captured' // Starts as Interest Captured as per visual workflow
    };

    fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setSubmitting(false);
        if (data.success) {
          setSubmissionResult(data.data);
          setStep(5);
        } else {
          alert('Submission error: ' + (data.error || 'Failed to submit application.'));
        }
      })
      .catch(() => {
        setSubmitting(false);
        alert('Server connection failed. Could not submit enrollment form.');
      });
  };

  // Validations for each step
  const isStepValid = () => {
    if (step === 1) {
      return formData.child_first_name.trim() !== '' &&
             formData.child_last_name.trim() !== '' &&
             formData.date_of_birth !== '' &&
             formData.requested_start_date !== '';
    }
    if (step === 2) {
      return true; // Prefs step is always valid since dropdowns are pre-selected
    }
    if (step === 3) {
      return formData.parent_name.trim() !== '' &&
             formData.parent_email.trim() !== '' &&
             formData.parent_phone.trim() !== '';
    }
    return true;
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.12) 0px, transparent 50%)
      `,
      backgroundAttachment: 'fixed',
      padding: '40px 24px'
    }}>
      {/* Header Panel */}
      <div style={{ maxWidth: '720px', width: '100%', margin: '0 auto', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>OnePath Crèche Pre-Enrolment</h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Workflow 1: Guided Parent Application Form</p>
        </div>
        <button onClick={onCloseForm} className="btn btn-secondary btn-sm">
          Return to Login
        </button>
      </div>

      <div className="glass-panel" style={{
        maxWidth: '720px',
        width: '100%',
        margin: '0 auto',
        padding: '36px',
        background: 'rgba(30, 41, 59, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 'var(--radius-xl)'
      }}>
        {/* Progress Tracker */}
        {step < 5 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              {['Child Profile', 'Care Choices', 'Guardian Contacts', 'Review Form'].map((label, idx) => (
                <div key={idx} style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: step === idx + 1 ? 'var(--primary)' : step > idx + 1 ? 'var(--accent-emerald)' : 'var(--text-muted)'
                }}>
                  {idx + 1}. {label}
                </div>
              ))}
            </div>
            {/* Bar */}
            <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(step / 4) * 100}%`,
                background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* STEP 1: Child Details */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>Child Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="child_first_name">Child's First Name *</label>
                  <input
                    id="child_first_name"
                    type="text"
                    name="child_first_name"
                    className="input-field"
                    value={formData.child_first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="child_last_name">Child's Last Name *</label>
                  <input
                    id="child_last_name"
                    type="text"
                    name="child_last_name"
                    className="input-field"
                    value={formData.child_last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="date_of_birth">Date of Birth *</label>
                  <input
                    id="date_of_birth"
                    type="date"
                    name="date_of_birth"
                    className="input-field"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="requested_start_date">Requested Start Date *</label>
                  <input
                    id="requested_start_date"
                    type="date"
                    name="requested_start_date"
                    className="input-field"
                    value={formData.requested_start_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Preferences */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>Care Preferences</h2>

              {/* Real-time Room Assignment Intelligence */}
              {loadingSuggestion ? (
                <div style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  textAlign: 'center',
                  fontSize: '0.85rem'
                }}>
                  Calculating room classification...
                </div>
              ) : suggestedRoom ? (
                <div style={{
                  padding: '16px',
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <div style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center' }}>
                    <Info size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f8fafc' }}>
                      Auto-Suggested Room: <span style={{ color: 'var(--accent-cyan)' }}>{suggestedRoom.name}</span>
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Based on age at entry ({ageMonths} months), Irish regulations require a staff ratio of <strong>{suggestedRoom.staff_ratio}</strong>. Room capacity is {suggestedRoom.capacity} places.
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '16px',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)'
                }}>
                  Fill in Date of Birth and Requested Start Date in Step 1 to calculate staff ratio requirements.
                </div>
              )}

              <div className="input-group">
                <label className="input-label" htmlFor="days_requested">Schedule/Days Requested</label>
                <select
                  id="days_requested"
                  name="days_requested"
                  className="select-field"
                  value={formData.days_requested}
                  onChange={handleChange}
                >
                  {DAYS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              {/* Sibling checkbox */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                marginTop: '16px'
              }}>
                <input
                  type="checkbox"
                  id="sibling_priority"
                  name="sibling_priority"
                  checked={formData.sibling_priority}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="sibling_priority" style={{ fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                  Do you have another child currently attending this crèche? (Sibling Priority)
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Guardian Details */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>Guardian Contact Details</h2>

              <div className="input-group">
                <label className="input-label" htmlFor="parent_name">Guardian Full Name *</label>
                <input
                  id="parent_name"
                  type="text"
                  name="parent_name"
                  className="input-field"
                  value={formData.parent_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="parent_email">Guardian Email *</label>
                  <input
                    id="parent_email"
                    type="email"
                    name="parent_email"
                    className="input-field"
                    value={formData.parent_email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="parent_phone">Guardian Phone Number *</label>
                  <input
                    id="parent_phone"
                    type="tel"
                    name="parent_phone"
                    className="input-field"
                    value={formData.parent_phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginTop: '8px' }}>
                <label className="input-label" htmlFor="medical_notes">Medical / Allergy notes</label>
                <textarea
                  id="medical_notes"
                  name="medical_notes"
                  className="textarea-field"
                  placeholder="Please state any food allergies, accessibility needs, or medical conditions..."
                  value={formData.medical_notes}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* STEP 4: Review Form */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>Review Application</h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Please review your details carefully before submitting. You cannot edit this information once sent.
              </p>

              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Child Name</span>
                    <div style={{ fontWeight: 700 }}>{formData.child_first_name} {formData.child_last_name}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Date of Birth</span>
                    <div style={{ fontWeight: 700 }}>{formData.date_of_birth}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Requested Start</span>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{formData.requested_start_date}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Assigned Room (Recommended)</span>
                    <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{suggestedRoom ? suggestedRoom.name : 'Checking...'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Schedule</span>
                    <div style={{ fontWeight: 700 }}>{formData.days_requested}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Sibling Priority</span>
                    <div style={{ fontWeight: 700 }}>{formData.sibling_priority ? 'Yes (Priority)' : 'No'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Guardian</span>
                    <div style={{ fontWeight: 700 }}>{formData.parent_name}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Guardian Contact</span>
                    <div style={{ fontWeight: 700 }}>{formData.parent_email} • {formData.parent_phone}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Medical / Allergy Notes:</span>
                  <div style={{ fontWeight: 500, fontSize: '0.8rem', marginTop: '2px', color: formData.medical_notes ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {formData.medical_notes || 'None recorded.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Success Acknowledgement */}
          {step === 5 && submissionResult && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                marginBottom: '20px'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Application Submitted!</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                Thank you, <strong>{formData.parent_name}</strong>. We have captured your interest form for <strong>{formData.child_first_name}</strong>.
              </p>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                maxWidth: '480px',
                margin: '0 auto 28px auto',
                fontSize: '0.85rem',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Reference Number:</span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>OP-ENROL-{submissionResult.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Assigned Room:</span>
                  <strong>{submissionResult.room_name || 'Unassigned'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Regulatory Staff Ratio:</span>
                  <strong>{submissionResult.staff_ratio || '1:11'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Submission Status:</span>
                  <span className="badge badge-interest_captured">Interest Captured</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onCloseForm}
                className="btn btn-primary"
                style={{ minWidth: '180px' }}
              >
                Back to Portal Homepage
              </button>
            </div>
          )}

          {/* Stepper Buttons (Footer) */}
          {step < 5 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '32px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '20px'
            }}>
              <button
                type="button"
                onClick={handlePrev}
                disabled={step === 1 || submitting}
                className="btn btn-secondary"
                style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
              >
                <ChevronLeft size={16} /> Back
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="btn btn-primary"
                >
                  Next Step <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-success"
                >
                  {submitting ? 'Submitting Form...' : 'Submit Application'} <CheckCircle2 size={16} />
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
