import React from 'react';
import { Link } from 'react-router-dom';
import { Vote, ShieldCheck, Heart, PhoneCall, HelpCircle, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#050914',
        borderTop: '1px solid #1E293B',
        marginTop: 'auto',
        color: '#94A3B8',
        fontSize: '0.9rem',
      }}
    >
      <div className="container-custom" style={{ padding: '3.5rem 1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Column 1: Brand & Tagline */}
          <div style={{ maxWidth: '320px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '2.2rem',
                  height: '2.2rem',
                  borderRadius: '0.65rem',
                  background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Vote size={18} color="#FFFFFF" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC' }}>
                Vote<span style={{ color: '#38BDF8' }}>Pulse</span>
              </span>
            </Link>
            <p style={{ color: '#CBD5E1', fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.75rem' }}>
              "Your Voice. Your Choice. Your Future."
            </p>
            <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5 }}>
              A modern, decentralized, and accountable online voting platform engineered for community, student, and organizational ballots.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/polls" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Explore Polls
                </Link>
              </li>
              <li>
                <Link to="/news" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Latest Poll News
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  About VotePulse
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Roles & Actions */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Participation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/voter" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  Voter Hub
                </Link>
              </li>
              <li>
                <Link to="/candidate" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  Candidate Portal
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  Sign In / Register
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: '#94A3B8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <PhoneCall size={14} color="#38BDF8" /> Direct Contact Form
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Governance & Legal */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Integrity & Trust
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#64748B' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#10B981" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                <span>Single-ballot cryptographic transaction guarantee.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <FileText size={18} color="#38BDF8" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                <span>Zero email storage policy — phone & username verification.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner & Disclaimer */}
        <div style={{ borderTop: '1px solid #1E293B', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '820px' }}>
            <strong>Demonstration Notice:</strong> VotePulse is built as an educational demonstration micro-project showcasing a full-stack React, Python Flask, Docker, and Kubernetes architecture. It is not officially certified for government or binding civic elections.
          </p>
          <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
            &copy; {new Date().getFullYear()} VotePulse Platform. All rights reserved. Built with modern full-stack technologies.
          </div>
        </div>
      </div>
    </footer>
  );
}
