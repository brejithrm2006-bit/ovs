import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  ShieldAlert,
  Database,
  Lock,
  Container,
  Server,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '880px' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.25rem' }}>
          Platform Configuration & Security
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.92rem' }}>
          Environment variables, credential rotation policies, and container architecture status.
        </p>
      </div>

      {/* Production Warning Alert */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
        }}
      >
        <AlertTriangle size={24} color="#FBBF24" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
        <div>
          <div style={{ fontWeight: 700, color: '#FBBF24', fontSize: '1rem', marginBottom: '0.2rem' }}>
            College Demo Initialization Notice
          </div>
          <div style={{ color: '#CBD5E1', fontSize: '0.88rem', lineHeight: 1.5 }}>
            The application is operating with initial demonstration credentials initialized via backend environment variables (<code>brmovs</code> / <code>7025919468</code>).
            Prior to deploying to an external production network, rotate passwords and configure a hardened <code>SECRET_KEY</code> and <code>JWT_SECRET_KEY</code> in your <code>.env</code> file.
          </div>
        </div>
      </div>

      {/* Security Architecture Parameters */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={18} color="#38BDF8" /> Cryptographic & Session Parameters
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#0B1120', borderRadius: '0.65rem', border: '1px solid #1E293B' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Password Hashing Algorithm</div>
            <div style={{ fontWeight: 700, color: '#F8FAFC', marginTop: '0.25rem' }}>Werkzeug scrypt / pbkdf2:sha256</div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#0B1120', borderRadius: '0.65rem', border: '1px solid #1E293B' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>JWT Session Expiration</div>
            <div style={{ fontWeight: 700, color: '#38BDF8', marginTop: '0.25rem' }}>24 Hours (Configurable)</div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#0B1120', borderRadius: '0.65rem', border: '1px solid #1E293B' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Authentication Modality</div>
            <div style={{ fontWeight: 700, color: '#10B981', marginTop: '0.25rem' }}>Zero-Email Phone & Username</div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#0B1120', borderRadius: '0.65rem', border: '1px solid #1E293B' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Role-Based Access Control</div>
            <div style={{ fontWeight: 700, color: '#FBBF24', marginTop: '0.25rem' }}>Voter, Candidate, Admin</div>
          </div>
        </div>
      </div>

      {/* Deployment & Workload Status */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Container size={18} color="#10B981" /> Container & Workload Configuration
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', backgroundColor: '#0B1120', borderRadius: '0.5rem', border: '1px solid #1E293B' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#F8FAFC' }}>Frontend Production Image</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Nginx 1.25 Alpine reverse proxying <code>/api</code> requests</div>
            </div>
            <span className="badge badge-active">PORT 8080 / 80</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', backgroundColor: '#0B1120', borderRadius: '0.5rem', border: '1px solid #1E293B' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#F8FAFC' }}>Backend Application Service</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Flask REST API listening on 0.0.0.0</div>
            </div>
            <span className="badge badge-active">PORT 5000</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', backgroundColor: '#0B1120', borderRadius: '0.5rem', border: '1px solid #1E293B' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#F8FAFC' }}>PostgreSQL Relational Database</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Persistent volume mount with unique vote constraints</div>
            </div>
            <span className="badge badge-active">PORT 5432</span>
          </div>
        </div>
      </div>
    </div>
  );
}
