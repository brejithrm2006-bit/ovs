import React from 'react';

export function CardSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', minHeight: '300px' }}>
          <div className="skeleton" style={{ width: '100%', height: '140px', marginBottom: '1rem' }} />
          <div className="skeleton" style={{ width: '40%', height: '20px', marginBottom: '0.75rem' }} />
          <div className="skeleton" style={{ width: '80%', height: '26px', marginBottom: '0.75rem' }} />
          <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '1.25rem' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="skeleton" style={{ width: '30%', height: '36px' }} />
            <div className="skeleton" style={{ width: '30%', height: '36px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', width: '100%' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <div className="skeleton" style={{ width: '50%', height: '16px', marginBottom: '0.75rem' }} />
          <div className="skeleton" style={{ width: '70%', height: '36px', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ width: '40%', height: '14px' }} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', width: '100%' }}>
      <div className="skeleton" style={{ width: '100%', height: '44px', marginBottom: '1rem' }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ width: '100%', height: '52px', marginBottom: '0.5rem' }} />
      ))}
    </div>
  );
}
