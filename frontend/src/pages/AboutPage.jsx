import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Server, Database, Container, Lock, Cpu, Layers, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container-custom" style={{ padding: '3.5rem 1.5rem 5rem', maxWidth: '960px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
          Architecture & Purpose
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.75rem' }}>
          About VotePulse
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
          An educational full-stack online voting platform built with React, Python Flask, PostgreSQL, Docker, and Kubernetes.
        </p>
      </div>

      {/* Engineering Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '1rem', borderTop: '4px solid #38BDF8' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '0.5rem', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8', marginBottom: '1rem' }}>
            <Cpu size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.5rem' }}>
            Frontend React Architecture
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: 1.6 }}>
            Engineered with React 18, Vite tooling, Lucide React icons, and Recharts visualization. Implements real-time countdowns, responsive dashboards, and interactive modals without browser alerts.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '1rem', borderTop: '4px solid #818CF8' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '0.5rem', backgroundColor: 'rgba(129, 140, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8', marginBottom: '1rem' }}>
            <Server size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.5rem' }}>
            Python REST API Backend
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: 1.6 }}>
            Constructed with Python Flask, Flask-JWT-Extended, and SQLAlchemy ORM. Features atomic database transactions, role-based decorators, and admin audit trail logging.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '1rem', borderTop: '4px solid #10B981' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', marginBottom: '1rem' }}>
            <Container size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.5rem' }}>
            Docker & Kubernetes DevOps
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: 1.6 }}>
            Multi-stage Docker builds with Nginx reverse proxying, Docker Compose service orchestration, and declarative Kubernetes manifests with health probes and persistent volumes.
          </p>
        </div>
      </div>

      {/* Cybersecurity & Integrity Standards */}
      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '1.25rem', marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '1rem' }}>
          Security & Voting Integrity Model
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="#10B981" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <strong style={{ color: '#F8FAFC' }}>Single Vote Database Constraint:</strong>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                A composite unique index on <code>(poll_id, voter_id)</code> prevents race conditions and strictly guarantees one vote per eligible voter.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="#10B981" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <strong style={{ color: '#F8FAFC' }}>Zero-Email Infrastructure:</strong>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Authentication operates exclusively via normalized usernames, phone numbers, and salted password hashes.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="#10B981" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <strong style={{ color: '#F8FAFC' }}>Backend State Verification:</strong>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Every vote is verified against current server UTC timestamps and official candidate registration before being committed.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="#10B981" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <strong style={{ color: '#F8FAFC' }}>Audit Logging:</strong>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                All administrative actions (poll creation, approvals, status toggles) are written to persistent audit logs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* College Micro-Project Notice */}
      <div style={{ padding: '1.75rem', backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '1rem', border: '1px solid #334155', textAlign: 'center' }}>
        <p style={{ color: '#CBD5E1', fontSize: '0.9rem', lineHeight: 1.6 }}>
          <strong>Academic Demonstration Disclosure:</strong> VotePulse demonstrates full-stack software architecture principles for college evaluation. For binding real-world governmental elections, additional certified cryptographic hardware, coercion resistance, and paper audit trails are legally mandated.
        </p>
      </div>
    </div>
  );
}
