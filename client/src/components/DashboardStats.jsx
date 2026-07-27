import React from 'react';
import { Users, TrendingUp, Euro, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DashboardStats({ summary, taskCount }) {
  const total = summary?.totalApplications || 0;
  const confirmed = summary?.confirmedCount || 0;
  const conversionRate = summary?.conversionRate || '0%';

  // calculate total deposits
  const stageCountsMap = (summary?.stageCounts || []).reduce((acc, curr) => {
    acc[curr.stage] = curr.count;
    return acc;
  }, {});

  const offerCount = stageCountsMap['offer_sent'] || 0;
  const depositPendingCount = stageCountsMap['deposit_pending'] || 0;
  const waitlistCount = stageCountsMap['waiting_list'] || 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
      marginBottom: '28px'
    }}>
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Pipeline Enquiries</span>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Users size={20} />
          </div>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{total}</div>
        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          {waitlistCount} children currently on waiting list
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Conversion Rate</span>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <TrendingUp size={20} />
          </div>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>{conversionRate}</div>
        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          {confirmed} confirmed active enrolments
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Deposit & Offer Ageing</span>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
            <Euro size={20} />
          </div>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fb7185' }}>
          {offerCount + depositPendingCount} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Offers</span>
        </div>
        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          {depositPendingCount} pending deposit verification
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Pending Staff Actions / SLAs</span>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Clock size={20} />
          </div>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: taskCount > 0 ? '#fbbf24' : 'var(--text-primary)' }}>
          {taskCount} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tasks</span>
        </div>
        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Follow-up reminders & missing docs
        </div>
      </div>
    </div>
  );
}
