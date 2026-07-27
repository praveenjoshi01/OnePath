import React, { useState } from 'react';
import { CheckSquare, Square, Clock, Plus, AlertCircle, FileText } from 'lucide-react';

export default function TaskDrawer({ tasks, onToggleTask, onCreateTask, enquiries }) {
  const [showForm, setShowForm] = useState(false);
  const [appId, setAppId] = useState(enquiries[0]?.id || '');
  const [taskType, setTaskType] = useState('follow_up');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !appId) return;
    onCreateTask({
      application_id: Number(appId),
      task_type: taskType,
      title,
      due_date: dueDate
    });
    setTitle('');
    setShowForm(false);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="#f59e0b" /> Follow-Up Tasks & SLA Reminders
        </h2>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* New Task Inline Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: 'var(--bg-surface)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <div className="input-group">
            <label className="input-label">Select Prospective Child</label>
            <select className="select-field" value={appId} onChange={(e) => setAppId(e.target.value)}>
              {enquiries.map(a => (
                <option key={a.id} value={a.id}>{a.child_first_name} {a.child_last_name} ({a.parent_name})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Task Category</label>
              <select className="select-field" value={taskType} onChange={(e) => setTaskType(e.target.value)}>
                <option value="follow_up">Enquiry Follow-up</option>
                <option value="deposit_reminder">Deposit Reminder</option>
                <option value="missing_documents">Missing Documents (Birth Cert/Vaccines)</option>
                <option value="offer_expiry">Offer Expiry Check</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Due Date</label>
              <input type="date" className="input-field" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Task Description</label>
            <input type="text" className="input-field" placeholder="e.g. Call parent regarding ECCE scheme documents" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Save Task</button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
        {tasks.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
            No pending tasks. All follow-ups are up to date!
          </div>
        ) : (
          tasks.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <div key={task.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: isDone ? 'rgba(15, 23, 42, 0.4)' : 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                opacity: isDone ? 0.6 : 1,
                transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => onToggleTask(task.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDone ? '#34d399' : 'var(--text-secondary)' }}
                  >
                    {isDone ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>

                  <div>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      textDecoration: isDone ? 'line-through' : 'none',
                      color: isDone ? 'var(--text-muted)' : '#f8fafc'
                    }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Child: <strong>{task.child_first_name} {task.child_last_name}</strong> ({task.parent_name})
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  fontWeight: 600
                }}>
                  Due: {task.due_date}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
