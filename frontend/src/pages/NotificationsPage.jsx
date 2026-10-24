import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { formatDateTime } from '../utils/formatters';
import EmptyState from '../components/EmptyState';
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function NotificationsPage() {
  const { refreshUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.notifications.getAll();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      refreshUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      refreshUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="container-custom" style={{ padding: '3rem 1.5rem 5rem', maxWidth: '820px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.25rem' }}>
            Notifications
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
            Stay informed on ballot confirmations, election updates, and application decisions.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleMarkAllRead}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #1E293B', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#94A3B8' }}>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You're all caught up! New updates regarding your votes and candidacies will appear here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((item) => {
            let Icon = Info;
            let iconColor = '#38BDF8';
            if (item.type === 'success') {
              Icon = CheckCircle2;
              iconColor = '#34D399';
            } else if (item.type === 'warning' || item.type === 'action') {
              Icon = AlertTriangle;
              iconColor = '#FBBF24';
            }

            return (
              <div
                key={item.id}
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '1rem',
                  backgroundColor: item.is_read ? 'rgba(15, 23, 42, 0.6)' : 'rgba(30, 41, 59, 0.75)',
                  border: item.is_read ? '1px solid #1E293B' : '1px solid rgba(56, 189, 248, 0.4)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                }}
              >
                {!item.is_read && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '1.25rem',
                      left: '0.65rem',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#38BDF8',
                    }}
                  />
                )}

                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: iconColor,
                  }}
                >
                  <Icon size={18} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC' }}>
                      {item.title}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {formatDateTime(item.created_at)}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: 1.5, marginBottom: item.link ? '0.75rem' : '0' }}>
                    {item.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: item.link ? '0.5rem' : '0' }}>
                    {item.link ? (
                      <Link
                        to={item.link}
                        onClick={() => !item.is_read && handleMarkRead(item.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#38BDF8',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        View Details <ArrowRight size={14} />
                      </Link>
                    ) : <div />}

                    {!item.is_read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(item.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94A3B8',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
