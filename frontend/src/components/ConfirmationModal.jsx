import React from 'react';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'primary', // 'primary', 'danger', 'success'
  children,
  loading = false,
}) {
  if (!isOpen) return null;

  let Icon = Info;
  let confirmBtnClass = 'btn-primary';
  let iconColor = '#38BDF8';

  if (type === 'danger') {
    Icon = AlertTriangle;
    confirmBtnClass = 'btn-danger';
    iconColor = '#EF4444';
  } else if (type === 'success') {
    Icon = CheckCircle2;
    confirmBtnClass = 'btn-success';
    iconColor = '#10B981';
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: '#0F172A',
          border: '1px solid #334155',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1E293B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(30, 41, 59, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} color={iconColor} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#F8FAFC' }}>{title}</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', color: '#CBD5E1', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {message && <p style={{ marginBottom: children ? '1rem' : '0' }}>{message}</p>}
          {children}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.25rem 1.5rem', backgroundColor: '#0B1120', borderTop: '1px solid #1E293B' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${confirmBtnClass}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
