import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Toast from '../components/Toast';
import {
  Vote,
  LayoutDashboard,
  CheckSquare,
  Users,
  FileCheck,
  GitPullRequest,
  UserCheck,
  BarChart3,
  Newspaper,
  MessageSquare,
  TrendingUp,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  Shield,
  Award,
  User,
  ArrowLeft
} from 'lucide-react';

export default function DashboardLayout({ role = 'admin' }) {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const adminNavItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Polls', path: '/admin/polls', icon: CheckSquare },
    { label: 'Manage Candidates', path: '/admin/candidates', icon: Users },
    { label: 'Candidate Applications', path: '/admin/applications', icon: FileCheck },
    { label: 'New Poll Requests', path: '/admin/poll-requests', icon: GitPullRequest },
    { label: 'Voter Management', path: '/admin/voters', icon: UserCheck },
    { label: 'Live Results', path: '/admin/results', icon: BarChart3 },
    { label: 'Poll News', path: '/admin/news', icon: Newspaper },
    { label: 'Contact Messages', path: '/admin/messages', icon: MessageSquare },
    { label: 'Reports', path: '/admin/reports', icon: TrendingUp },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const candidateNavItems = [
    { label: 'Candidate Overview', path: '/candidate', icon: LayoutDashboard },
    { label: 'Available Polls', path: '/polls', icon: CheckSquare },
    { label: 'My Notifications', path: '/notifications', icon: Bell },
  ];

  const voterNavItems = [
    { label: 'Voter Overview', path: '/voter', icon: LayoutDashboard },
    { label: 'Active Ballots', path: '/polls', icon: CheckSquare },
    { label: 'My Notifications', path: '/notifications', icon: Bell },
  ];

  let currentNavItems = adminNavItems;
  let dashboardTitle = 'Administrator Console';
  let badgeIcon = <Shield size={12} />;
  let badgeColor = '#EF4444';

  if (role === 'candidate') {
    currentNavItems = candidateNavItems;
    dashboardTitle = 'Candidate Portal';
    badgeIcon = <Award size={12} />;
    badgeColor = '#F59E0B';
  } else if (role === 'voter') {
    currentNavItems = voterNavItems;
    dashboardTitle = 'Voter Dashboard';
    badgeIcon = <User size={12} />;
    badgeColor = '#38BDF8';
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#080D1A', color: '#F8FAFC' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '280px',
          backgroundColor: '#0B1120',
          borderRight: '1px solid #1E293B',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 40,
          transition: 'transform 0.3s ease',
        }}
        className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
      >
        {/* Brand */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '2.4rem',
                height: '2.4rem',
                borderRadius: '0.65rem',
                background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Vote size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1.1 }}>
                Vote<span style={{ color: '#38BDF8' }}>Pulse</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {dashboardTitle}
              </div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'none' }}
            className="mobile-close-sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <div style={{ flex: 1, padding: '1.25rem 0.85rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.5rem 0.75rem' }}>
            Menu
          </div>

          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.65rem',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: isActive ? '#2563EB' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
                className={isActive ? '' : 'glass-panel-hover'}
              >
                <Icon size={18} color={isActive ? '#FFFFFF' : '#64748B'} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div style={{ height: '1px', backgroundColor: '#1E293B', margin: '0.75rem 0' }} />

          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '0.65rem',
              textDecoration: 'none',
              fontSize: '0.9rem',
              color: '#94A3B8',
            }}
            className="glass-panel-hover"
          >
            <ArrowLeft size={18} color="#64748B" />
            <span>Public Home</span>
          </Link>
        </div>

        {/* User Footer Profile */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1E293B', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#38BDF8',
                }}
              >
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.full_name}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  @{user?.username}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#EF4444',
                cursor: 'pointer',
                padding: '0.35rem',
                borderRadius: '0.35rem',
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minWidth: 0 }} className="dashboard-main">
        {/* Top Header */}
        <header
          style={{
            height: '4.25rem',
            backgroundColor: 'rgba(11, 17, 32, 0.85)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'transparent', border: 'none', color: '#F8FAFC', cursor: 'pointer', display: 'none' }}
              className="mobile-open-sidebar"
            >
              <Menu size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC' }}>
              {dashboardTitle}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #334155' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: badgeColor }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#CBD5E1', textTransform: 'capitalize' }}>
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ padding: '2rem', flex: 1 }}>
          <Outlet />
        </main>
      </div>

      <Toast />

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 992px) {
          .dashboard-sidebar {
            transform: translateX(-100%);
          }
          .dashboard-sidebar.sidebar-open {
            transform: translateX(0);
          }
          .dashboard-main {
            margin-left: 0 !important;
          }
          .mobile-open-sidebar {
            display: block !important;
          }
          .mobile-close-sidebar {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
