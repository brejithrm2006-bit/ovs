import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/formatters';
import {
  Newspaper,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';

export default function AdminNews() {
  const { addToast } = useNotifications();

  const [news, setNews] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);

  const [formData, setFormData] = useState({
    headline: '',
    summary: '',
    content: '',
    cover_image: '',
    related_poll_id: '',
    is_published: true,
  });

  const [actionLoading, setActionLoading] = useState(false);

  const fetchNewsAndPolls = async () => {
    setLoading(true);
    try {
      const [newsRes, pollsRes] = await Promise.all([
        api.news.adminList(),
        api.polls.list({ per_page: 50 }),
      ]);
      setNews(newsRes.news || []);
      setPolls(pollsRes.polls || []);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', message: 'Could not load news.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsAndPolls();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.headline || !formData.summary || !formData.content) {
      addToast({ type: 'warning', title: 'Required Fields', message: 'Headline, summary, and content are required.' });
      return;
    }

    setActionLoading(true);
    try {
      await api.news.adminCreate({
        ...formData,
        related_poll_id: formData.related_poll_id ? parseInt(formData.related_poll_id) : null,
      });
      addToast({ type: 'success', title: 'Bulletin Created', message: 'News article published successfully.' });
      setCreateModalOpen(false);
      fetchNewsAndPolls();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!activeArticle) return;

    setActionLoading(true);
    try {
      await api.news.adminUpdate(activeArticle.id, {
        ...formData,
        related_poll_id: formData.related_poll_id ? parseInt(formData.related_poll_id) : null,
      });
      addToast({ type: 'success', title: 'Article Updated', message: 'News article changes saved.' });
      setEditModalOpen(false);
      fetchNewsAndPolls();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await api.news.adminDelete(deleteTarget.id);
      addToast({ type: 'success', title: 'Deleted', message: 'News article deleted.' });
      setDeleteTarget(null);
      fetchNewsAndPolls();
    } catch (err) {
      addToast({ type: 'error', title: 'Delete Error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (item) => {
    setActiveArticle(item);
    setFormData({
      headline: item.headline,
      summary: item.summary,
      content: item.content,
      cover_image: item.cover_image || '',
      related_poll_id: item.related_poll_id || '',
      is_published: item.is_published,
    });
    setEditModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.25rem' }}>
            Poll News & Announcements
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.92rem' }}>
            Publish statements, town hall updates, and election announcements for voters.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setFormData({
              headline: '',
              summary: '',
              content: '',
              cover_image: '',
              related_poll_id: '',
              is_published: true,
            });
            setCreateModalOpen(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> New Announcement
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : news.length === 0 ? (
        <EmptyState title="No news articles" description="Create an announcement for the community." />
      ) : (
        <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0B1120', borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Headline</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Related Poll</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Published Date</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #1E293B' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#F8FAFC', maxWidth: '300px' }}>
                      {item.headline}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#38BDF8' }}>
                      {item.related_poll_title || 'General Platform'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${item.is_published ? 'badge-active' : 'badge-closed'}`}>
                        {item.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.8rem' }}>
                      {formatDate(item.published_at)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => openEditModal(item)}
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {createModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(3, 7, 18, 0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ maxWidth: '620px', width: '100%', backgroundColor: '#0F172A', borderRadius: '1rem', border: '1px solid #334155', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1E293B' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC' }}>Publish News Article</h3>
              <button onClick={() => setCreateModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div className="form-group">
                <label className="form-label">Headline *</label>
                <input type="text" className="form-input" value={formData.headline} onChange={(e) => setFormData({ ...formData, headline: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Related Poll (Optional)</label>
                <select className="form-select" value={formData.related_poll_id} onChange={(e) => setFormData({ ...formData, related_poll_id: e.target.value })}>
                  <option value="">General Platform Announcement</option>
                  {polls.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Short Summary *</label>
                <textarea rows="2" className="form-textarea" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Full Article Content *</label>
                <textarea rows="5" className="form-textarea" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Cover Image URL</label>
                <input type="url" className="form-input" placeholder="https://example.com/cover.jpg" value={formData.cover_image} onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })} />
              </div>

              <div style={{ margin: '1rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#CBD5E1', fontSize: '0.88rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} style={{ accentColor: '#2563EB' }} />
                  Publish immediately (Unpublished drafts are visible only to admins)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #1E293B', paddingTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>{actionLoading ? 'Publishing...' : 'Publish Announcement'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(3, 7, 18, 0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ maxWidth: '620px', width: '100%', backgroundColor: '#0F172A', borderRadius: '1rem', border: '1px solid #334155', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1E293B' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC' }}>Edit Announcement</h3>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdate} style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div className="form-group">
                <label className="form-label">Headline</label>
                <input type="text" className="form-input" value={formData.headline} onChange={(e) => setFormData({ ...formData, headline: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Summary</label>
                <textarea rows="2" className="form-textarea" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea rows="5" className="form-textarea" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required />
              </div>

              <div style={{ margin: '1rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#CBD5E1', fontSize: '0.88rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} style={{ accentColor: '#2563EB' }} />
                  Article is Published
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #1E293B', paddingTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${deleteTarget?.headline}"? This cannot be undone.`}
        confirmText="Delete Article"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
}
