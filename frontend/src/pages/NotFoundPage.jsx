import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container-custom" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <div className="glass-panel" style={{ padding: '3.5rem 2.5rem', borderRadius: '1.5rem', maxWidth: '520px', width: '100%' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8', margin: '0 auto 1.5rem' }}>
          <HelpCircle size={36} />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.5rem', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38BDF8', marginBottom: '1rem' }}>
          Ballot Resource Not Found
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          The election page, article, or resource you are looking for has been moved, archived, or does not exist.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Home size={16} /> Return to Home
          </Link>
          <Link to="/polls" className="btn btn-secondary">
            Explore Polls
          </Link>
        </div>
      </div>
    </div>
  );
}
