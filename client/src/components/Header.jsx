import React from 'react';
import { Layers, Plus, RefreshCw, Sparkles, Building2, LogOut } from 'lucide-react';

export default function Header({ onOpenNewModal, onRefresh, loading, user, onLogout }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 32px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
        }}>
          <Layers color="#fff" size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              OnePath <span style={{ color: '#818cf8', WebkitTextFillColor: 'initial' }}>Enrollment Manager</span>
            </h1>
            <span style={{
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.725rem',
              fontWeight: 600
            }}>
              Pre-Enrolment & Interoperability Layer
            </span>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={14} color="#06b6d4" />
            Irish Early Years Provider Engine • Vendor-Independent CRM & API Handoff
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* User Info & Logout Button */}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginRight: '8px',
            borderRight: '1px solid var(--border-color)',
            paddingRight: '20px'
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#f8fafc' }}>{user.name}</div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user.role}</div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onLogout}
              title="Sign Out"
              style={{
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        )}

        <button className="btn btn-secondary btn-sm" onClick={onRefresh} disabled={loading} title="Refresh data">
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
        
        {user && (
          <button className="btn btn-primary" onClick={onOpenNewModal}>
            <Plus size={18} />
            New Enquiry
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </header>
  );
}
