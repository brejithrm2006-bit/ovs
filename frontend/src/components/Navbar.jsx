import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Vote,
  Bell,
  User,
  Shield,
  Award,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isCandidate, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin';
    if (isCandidate) return '/candidate';
    return '/voter';
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
          <Shield size={11} /> ADMIN
        </span>
      );
    }
    if (isCandidate) {
      return (
        <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
          <Award size={11} /> CANDIDATE
        </span>
      );
    }
    return (
      <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
        <User size={11} /> VOTER
      </span>
    );
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(8, 13, 26, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
      }}
    >
      <div className="container-custom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.5rem' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            }}
          >
            <Vote size={22} color="#FFFFFF" />
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#F8FAFC' }}>
              Vote<span style={{ color: '#38BDF8' }}>Pulse</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '1.75rem' }} className="desktop-nav">
          <Link to="/" style={{ color: location.pathname === '/' ? '#38BDF8' : '#CBD5E1', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500, transition: 'color 0.15s' }}>
            Home
          </Link>
          <Link to="/polls" style={{ color: location.pathname === '/polls' ? '#38BDF8' : '#CBD5E1', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500, transition: 'color 0.15s' }}>
            Explore Polls
          </Link>
          <Link to="/news" style={{ color: location.pathname.startsWith('/news') ? '#38BDF8' : '#CBD5E1', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500, transition: 'color 0.15s' }}>
            Latest News
          </Link>
          <Link to="/about" style={{ color: location.pathname === '/about' ? '#38BDF8' : '#CBD5E1', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500, transition: 'color 0.15s' }}>
            About
          </Link>
          <Link to="/contact" style={{ color: location.pathname === '/contact' ? '#38BDF8' : '#CBD5E1', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 500, transition: 'color 0.15s' }}>
            Contact
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="desktop-actions">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <Link
                to="/notifications"
                style={{
                  position: 'relative',
                  width: '2.4rem',
                  height: '2.4rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#CBD5E1',
                  textDecoration: 'none',
                }}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #080D1A',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid #334155',
                    borderRadius: '0.65rem',
                    padding: '0.4rem 0.85rem',
                    cursor: 'pointer',
                    color: '#F8FAFC',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>
                      {user?.full_name || user?.username}
                    </span>
                    {getRoleBadge()}
                  </div>
                  <ChevronDown size={14} color="#94A3B8" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="glass-panel"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.5rem)',
                      right: 0,
                      width: '220px',
                      backgroundColor: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      padding: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      zIndex: 60,
                    }}
                  >
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 0.85rem',
                        color: '#F8FAFC',
                        textDecoration: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.88rem',
                      }}
                      className="glass-panel-hover"
                    >
                      <LayoutDashboard size={16} color="#38BDF8" />
                      Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 0.85rem',
                        color: '#F8FAFC',
                        textDecoration: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.88rem',
                      }}
                      className="glass-panel-hover"
                    >
                      <User size={16} color="#38BDF8" />
                      My Profile
                    </Link>

                    <div style={{ height: '1px', backgroundColor: '#1E293B', margin: '0.25rem 0' }} />

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 0.85rem',
                        color: '#F87171',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                      }}
                      className="glass-panel-hover"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.88rem' }}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.15rem', fontSize: '0.88rem' }}>
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: '#F8FAFC',
            padding: '0.5rem',
            cursor: 'pointer',
          }}
          className="mobile-toggle"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#0B1120',
            borderBottom: '1px solid #1E293B',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
          className="mobile-drawer"
        >
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#F8FAFC', textDecoration: 'none', padding: '0.5rem 0', fontSize: '1rem' }}
          >
            Home
          </Link>
          <Link
            to="/polls"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#F8FAFC', textDecoration: 'none', padding: '0.5rem 0', fontSize: '1rem' }}
          >
            Explore Polls
          </Link>
          <Link
            to="/news"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#F8FAFC', textDecoration: 'none', padding: '0.5rem 0', fontSize: '1rem' }}
          >
            Latest News
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#F8FAFC', textDecoration: 'none', padding: '0.5rem 0', fontSize: '1rem' }}
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#F8FAFC', textDecoration: 'none', padding: '0.5rem 0', fontSize: '1rem' }}
          >
            Contact
          </Link>

          <div style={{ height: '1px', backgroundColor: '#1E293B', margin: '0.5rem 0' }} />

          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Go to Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                My Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ width: '100%' }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Responsive media styling rule helper */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-toggle { display: none !important; }
          .mobile-drawer { display: none !important; }
        }
      `}</style>
    </header>
  );
}
