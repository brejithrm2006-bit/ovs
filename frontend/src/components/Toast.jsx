import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '420px',
      width: 'calc(100vw - 3rem)',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => {
        let Icon = Info;
        let borderColor = 'rgba(56, 189, 248, 0.4)';
        let iconColor = '#38BDF8';
        let bg = 'rgba(15, 23, 42, 0.95)';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderColor = 'rgba(16, 185, 129, 0.5)';
          iconColor = '#34D399';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderColor = 'rgba(239, 68, 68, 0.5)';
          iconColor = '#F87171';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderColor = 'rgba(245, 158, 11, 0.5)';
          iconColor = '#FBBF24';
        }

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              background: bg,
              backdropFilter: 'blur(12px)',
              border: `1px solid ${borderColor}`,
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              animation: 'fadeInUp 0.25s ease-out',
            }}
          >
            <Icon size={20} color={iconColor} style={{ marginTop: '0.15rem', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              {toast.title && (
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#F8FAFC', marginBottom: '0.2rem' }}>
                  {toast.title}
                </div>
              )}
              <div style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.4 }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '0.15rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0.25rem',
              }}
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
