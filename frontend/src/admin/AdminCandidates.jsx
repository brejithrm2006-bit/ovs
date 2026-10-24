import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { formatDateTime } from '../utils/formatters';
import {
  Users,
  Plus,
  Edit,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X
} from 'lucide-react';

export default function AdminCandidates() {
  const { addToast } = useNotifications();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeCandidate, setActiveCandidate] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone: '',
    biography: '',
    qualifications: '',
    profile_image: '',
    status: 'approved',
  });

  const [actionLoading, setActionLoading] = useState(false);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.candidates.list(params);
      setCandidates(res.candidates || []);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', message: 'Could not load candidates.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [statusFilter]);

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.biography) {
      addToast({ type: 'warning', title: 'Missing Fields', message: 'Name and biography are required.' });
      return;
    }

    setActionLoading(true);
    try {
      await api.admin.createCandidate(formData);
      addToast({ type: 'success', title: 'Candidate Profile Created', message: 'Candidate added to database.' });
      setCreateModalOpen(false);
      fetchCandidates();
    } catch (err) {
      addToast({ type: 'error', title: 'Creation Error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCandidate = async (e) => {
    e.preventDefault();
    if (!activeCandidate) return;

    setActionLoading(true);
    try {
      await api.admin.updateCandidate(activeCandidate.id, formData);
      addToast({ type: 'success', title: 'Candidate Updated', message: 'Changes saved successfully.' });
      setEditModalOpen(false);
      fetchCandidates();
    } catch (err) {
      addToast({ type: 'error', title: 'Update Error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetStatus = async (candidateId, newStatus) => {
    try {
      await api.admin.updateCandidate(candidateId, { status: newStatus });
      addToast({ type: 'success', title: 'Status Updated', message: `Candidate set to ${newStatus}.` });
      fetchCandidates();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const openEditModal = (c) => {
    setActiveCandidate(c);
    setFormData({
      full_name: c.full_name,
      username: c.username || '',
      phone: c.phone || '',
      biography: c.biography,
      qualifications: c.qualifications || '',
      profile_image: c.profile_image || '',
      status: c.status,
    });
    setEditModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.25rem' }}>
            Official Candidate Registry
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.92rem' }}>
            Maintain candidate credentials, platform statements, and authorization statuses.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setFormData({
              full_name: '',
              username: '',
              phone: '',
              biography: '',
              qualifications: '',
              profile_image: '',
              status: 'approved',
            });
            setCreateModalOpen(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> New Candidate Profile
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>Filter Status:</span>
          {['All', 'approved', 'pending', 'rejected', 'suspended'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                backgroundColor: statusFilter === st ? '#2563EB' : 'rgba(30, 41, 59, 0.6)',
                borderColor: statusFilter === st ? '#38BDF8' : '#334155',
                color: statusFilter === st ? '#FFFFFF' : '#94A3B8',
              }}
            >
              {st.toUpperCase()}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchCandidates(); }} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '220px', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
          />
          <button type="submit" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem' }}>
            <Search size={14} />
          </button>
        </form>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : candidates.length === 0 ? (
        <EmptyState title="No candidates found" description="Create a candidate profile or adjust search criteria." />
      ) : (
        <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0B1120', borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Candidate</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Phone (Admin Only)</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Biography</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #1E293B' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={c.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={c.full_name}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{c.full_name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#38BDF8' }}>@{c.username || 'unlinked'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#CBD5E1', fontSize: '0.85rem' }}>
                      {c.phone || '—'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#94A3B8', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.biography}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${c.status === 'approved' ? 'badge-active' : c.status === 'suspended' ? 'badge-pending' : 'badge-closed'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => openEditModal(c)}
                        >
                          <Edit size={14} /> Edit
                        </button>

                        {c.status !== 'approved' && (
                          <button
                            type="button"
                            className="btn btn-success"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => handleSetStatus(c.id, 'approved')}
                          >
                            Approve
                          </button>
                        )}

                        {c.status === 'approved' && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: '#FBBF24' }}
                            onClick={() => handleSetStatus(c.id, 'suspended')}
                          >
                            Suspend
                          </button>
                        )}
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
          <div className="glass-panel" style={{ maxWidth: '580px', width: '100%', backgroundColor: '#0F172A', borderRadius: '1rem', border: '1px solid #334155', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1E293B' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC' }}>Create Candidate Profile</h3>
              <button onClick={() => setCreateModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateCandidate} style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-input" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Username (Optional)</label>
                  <input type="text" className="form-input" placeholder="e.g. marcus_v" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number (Admin Only)</label>
                  <input type="tel" className="form-input" placeholder="5550102222" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Biography *</label>
                <textarea rows="3" className="form-textarea" value={formData.biography} onChange={(e) => setFormData({ ...formData, biography: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Qualifications</label>
                <input type="text" className="form-input" value={formData.qualifications} onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Profile Image URL</label>
                <input type="url" className="form-input" value={formData.profile_image} onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #1E293B', paddingTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>{actionLoading ? 'Creating...' : 'Create Profile'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(3, 7, 18, 0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ maxWidth: '580px', width: '100%', backgroundColor: '#0F172A', borderRadius: '1rem', border: '1px solid #334155', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1E293B' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC' }}>Edit Candidate: {activeCandidate?.full_name}</h3>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdateCandidate} style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Biography</label>
                <textarea rows="3" className="form-textarea" value={formData.biography} onChange={(e) => setFormData({ ...formData, biography: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Qualifications</label>
                <input type="text" className="form-input" value={formData.qualifications} onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #1E293B', paddingTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
