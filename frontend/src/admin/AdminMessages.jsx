import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { formatDateTime } from '../utils/formatters';
import {
  MessageSquare,
  CheckCircle2,
  Phone,
  User,
  Clock,
  Eye,
  X,
  Save
} from 'lucide-react';

export default function AdminMessages() {
  const { addToast } = useNotifications();

  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isReadFilter, setIsReadFilter] = useState(''); // '' (all), 'false' (unread), 'true' (read)

  const [activeMessage, setActiveMessage] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.contact.adminList(isReadFilter !== '' ? isReadFilter : undefined);
      setMessages(res.messages || []);
      setUnreadCount(res.unread_count || 0);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch messages.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [isReadFilter]);

  const handleMarkRead = async (id) => {
    try {
      await api.contact.adminMarkRead(id);
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!activeMessage) return;

    setSavingNotes(true);
    try {
      await api.contact.adminSaveNotes(activeMessage.id, adminNotes);
      addToast({ type: 'success', title: 'Resolution Saved', message: 'Notes stored on contact record.' });
      setActiveMessage(null);
      fetchMessages();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setSavingNotes(false);
    }
  };

  const openMessageModal = (msg) => {
    setActiveMessage(msg);
    setAdminNotes(msg.admin_notes || '');
    if (!msg.is_read) {
      handleMarkRead(msg.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.25rem' }}>
          Contact Messages & Inquiries
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.92rem' }}>
          Direct inquiries submitted via the public contact channel. Verified by phone and name.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setIsReadFilter('')}
          className={`btn ${isReadFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
        >
          All Messages ({messages.length})
        </button>
        <button
          type="button"
          onClick={() => setIsReadFilter('false')}
          className={`btn ${isReadFilter === 'false' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
        >
          Unread Inquiries ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setIsReadFilter('true')}
          className={`btn ${isReadFilter === 'true' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
        >
          Resolved / Read
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : messages.length === 0 ? (
        <EmptyState title="No messages found" description="There are no contact messages with this filter." />
      ) : (
        <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0B1120', borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Sender Name</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Phone Number</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Subject</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Received At</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #1E293B', backgroundColor: m.is_read ? 'transparent' : 'rgba(56, 189, 248, 0.05)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#F8FAFC' }}>
                      {m.name}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#38BDF8' }}>
                      {m.phone}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#CBD5E1', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.subject}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${m.is_read ? 'badge-closed' : 'badge-active'}`}>
                        {m.is_read ? 'Read' : 'New'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.8rem' }}>
                      {formatDateTime(m.created_at)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        onClick={() => openMessageModal(m)}
                      >
                        <Eye size={14} /> View & Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW & RESOLUTION MODAL */}
      {activeMessage && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(3, 7, 18, 0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ maxWidth: '580px', width: '100%', backgroundColor: '#0F172A', borderRadius: '1rem', border: '1px solid #334155', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1E293B' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC' }}>Message from {activeMessage.name}</h3>
                <div style={{ fontSize: '0.8rem', color: '#38BDF8' }}>Phone: {activeMessage.phone}</div>
              </div>
              <button onClick={() => setActiveMessage(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Subject</h4>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F8FAFC' }}>{activeMessage.subject}</div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Message Content</h4>
                <div style={{ padding: '1rem', backgroundColor: '#0B1120', borderRadius: '0.5rem', color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {activeMessage.message}
                </div>
              </div>

              <form onSubmit={handleSaveNotes}>
                <div className="form-group">
                  <label className="form-label" htmlFor="admin_notes">Administrator Resolution Notes</label>
                  <textarea
                    id="admin_notes"
                    rows="3"
                    className="form-textarea"
                    placeholder="Enter resolution notes or forwarding action taken..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setActiveMessage(null)}>Close</button>
                  <button type="submit" className="btn btn-primary" disabled={savingNotes}>
                    <Save size={15} /> {savingNotes ? 'Saving...' : 'Save Resolution'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
