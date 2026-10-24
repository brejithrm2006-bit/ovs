import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionLabel,
  onAction,
}) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '1rem',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: '#38BDF8',
        }}
      >
        <Icon size={28} />
      </div>
      <h4 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '0.4rem' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.9rem', color: '#94A3B8', maxWidth: '420px', lineHeight: 1.5, marginBottom: actionLabel ? '1.25rem' : '0' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
