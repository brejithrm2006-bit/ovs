import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { formatDateTime } from '../utils/formatters';
import {
  CheckSquare,
  Plus,
  Edit,
  Radio,
  Archive,
  PowerOff,
  Users,
  Search,
  Filter,
  X,
  PlusCircle,
  Trash2
} from 'lucide-react';

export default function AdminPolls() {
  const { addToast } = useNotifications();

  const [polls, setPolls] = useState([]);
  const [candidatesList, setCandidatesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [activePoll, setActivePoll] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technology',
    banner_image: '',
    start_date: '',
    end_date: '',
    status: 'draft',
    results_visibility: 'public',
    max_candidates: 20,
    eligibility_rules: '',
  });

  // Candidate Assignment State
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [candidateStatement, setCandidateStatement] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  const categories = ['Technology', 'Student Activities', 'Innovation', 'Sports', 'Community', 'Entertainment', 'Other'];

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const params = { per_page: 50 };
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const [pollsRes, candRes] = await Promise.all([
        api.polls.list(params),
        api.candidates.list({ status: 'approved' }),
      ]);
      setPolls(pollsRes.polls || []);
      setCandidatesList(candRes.candidates || []);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', message: 'Could not load polls.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [statusFilter]);

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.start_date || !formData.end_date) {
      addToast({ type: 'warning', title: 'Missing Fields', message: 'Please complete all required fields.' });
      return;
    }

    setActionLoading(true);
    try {
      await api.admin.createPoll({
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      });
      addToast({ type: 'success', title: 'Poll Created', message: 'Official poll has been staged.' });
      setCreateModalOpen(false);
      fetchPolls();
    } catch (err) {
      addToast({ type: 'error', title: 'Creation Failed', message: err.message || 'Error creating poll.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePoll = async (e) => {
    e.preventDefault();
    if (!activePoll) return;
    setActionLoading(true);
    try {
      await api.admin.updatePoll(activePoll.id, {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
      });
      addToast({ type: 'success', title: 'Poll Updated', message: 'Changes committed successfully.' });
      setEditModalOpen(false);
      fetchPolls();
    } catch (err) {
      addToast({ type: 'error', title: 'Update Failed', message: err.message || 'Error updating poll.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishPoll = async (pollId) => {
    try {
      const res = await api.admin.publishPoll(pollId);
      addToast({ type: 'success', title: 'Poll Published', message: res.message });
      fetchPolls();
    } catch (err) {
      addToast({ type: 'error', title: 'Publishing Error', message: err.message || 'Error publishing poll.' });
    }
  };

  const handleClosePoll = async (pollId) => {
    try {
      const res = await api.admin.closePoll(pollId);
      addToast({ type: 'success', title: 'Poll Closed', message: res.message });
      fetchPolls();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleArchivePoll = async (pollId) => {
    try {
      const res = await api.admin.archivePoll(pollId);
      addToast({ type: 'success', title: 'Poll Archived', message: res.message });
      fetchPolls();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!activePoll || !selectedCandidateId) return;

    setActionLoading(true);
    try {
      await api.admin.addCandidateToPoll(activePoll.id, parseInt(selectedCandidateId), candidateStatement);
      addToast({ type: 'success', title: 'Candidate Assigned', message: 'Candidate added to this poll.' });
      setCandidateStatement('');
      // Reload poll details
      const updated = await api.polls.get(activePoll.id);
      setActivePoll(updated.poll);
      fetchPolls();
    } catch (err) {
      addToast({ type: 'error', title: 'Assignment Failed', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveCandidate = async (pollId, candidateId) => {
    try {
      await api.admin.removeCandidateFromPoll(pollId, candidateId);
      addToast({ type: 'success', title: 'Removed', message: 'Candidate removed from poll.' });
      const updated = await api.polls.get(pollId);
      setActivePoll(updated.poll);
      fetchPolls();
    } catch (err) {
      addToast({ type: 'error', title: 'Removal Failed', message: err.message });
    }
  };

  const openEditModal = (poll) => {
    setActivePoll(poll);
    setFormData({
      title: poll.title,
      description: poll.description,
      category: poll.category,
      banner_image: poll.banner_image || '',
      start_date: poll.start_date ? poll.start_date.slice(0, 16) : '',
      end_date: poll.end_date ? poll.end_date.slice(0, 16) : '',
      status: poll.status,
      results_visibility: poll.results_visibility,
      max_candidates: poll.max_candidates || 20,
      eligibility_rules: poll.eligibility_rules || '',
    });
    setEditModalOpen(true);
  };

  const openCandidateModal = async (poll) => {
    const res = await api.polls.get(poll.id);
    setActivePoll(res.poll);
    setSelectedCandidateId(candidatesList[0]?.id || '');
    setCandidateModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.25rem' }}>
            Poll & Election Management
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.92rem' }}>
            Stage official ballots, assign approved candidate nominees, and control poll lifecycles.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setFormData({
              title: '',
              description: '',
              category: 'Technology',
              banner_image: '',
              start_date: '',
              end_date: '',
              status: 'draft',
              results_visibility: 'public',
              max_candidates: 20,
              eligibility_rules: '',
            });
            setCreateModalOpen(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> Create Official Poll
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>Status Filter:</span>
          {['All', 'draft', 'upcoming', 'active', 'closed', 'archived'].map((st) => (
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

        <form onSubmit={(e) => { e.preventDefault(); fetchPolls(); }} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search polls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '220px', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
          />
          <button type="submit" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem' }}>
            <Search size={14} />
          </button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : polls.length === 0 ? (
        <EmptyState title="No polls found" description="Create a new poll or adjust your status filter." />
      ) : (
        <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0B1120', borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Poll Title</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Category</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Candidates</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Total Votes</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Visibility</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {polls.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1E293B' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#F8FAFC' }}>
                      <Link to={`/polls/${p.id}`} style={{ color: '#F8FAFC', textDecoration: 'none' }} className="hover:underline">
                        {p.title}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="badge badge-category">{p.category}</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#38BDF8', fontWeight: 600 }}>
                      {p.candidate_count || 0} candidates
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#34D399', fontWeight: 600 }}>
                      {p.total_votes || 0}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${p.status === 'active' ? 'badge-active' : p.status === 'closed' ? 'badge-closed' : 'badge-upcoming'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#94A3B8', fontSize: '0.82rem' }}>
                      {p.results_visibility}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => openCandidateModal(p)}
                          title="Assign / Remove Candidates"
                        >
                          <Users size={14} /> Candidates
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => openEditModal(p)}
                          title="Edit Poll Details"
                        >
                          <Edit size={14} /> Edit
                        </button>

                        {p.status === 'draft' && (
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => handlePublishPoll(p.id)}
                            title="Publish Live"
                          >
                            <Radio size={14} /> Publish
                          </button>
                        )}

                        {p.status === 'active' && (
                          <button
                            type="button"
                            className="btn btn-danger"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => handleClosePoll(p.id)}
                            title="Close Poll"
                          >
                            <PowerOff size={14} /> Close
                          </button>
                        )}

                        {p.status === 'closed' && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => handleArchivePoll(p.id)}
                            title="Archive Historical"
                          >
                            <Archive size={14} /> Archive
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

      {/* CREATE POLL MODAL */}
      {createModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(3, 7, 18, 0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ maxWidth: '640px', width: '100%', backgroundColor: '#0F172A', borderRadius: '1rem', border: '1px solid #334155', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1E293B' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC' }}>Create Official Community Poll</h3>
              <button onClick={() => setCreateModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreatePoll} style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div className="form-group">
                <label className="form-label">Poll Title *</label>
                <input type="text" className="form-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Results Visibility</label>
                  <select className="form-select" value={formData.results_visibility} onChange={(e) => setFormData({ ...formData, results_visibility: e.target.value })}>
                    <option value="public">Public (Visible during voting)</option>
                    <option value="hidden_until_close">Hidden Until Poll Closes</option>
                    <option value="admin_only">Admin Only</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea rows="3" className="form-textarea" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date & Time *</label>
                  <input type="datetime-local" className="form-input" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date & Time *</label>
                  <input type="datetime-local" className="form-input" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Banner Image URL</label>
                <input type="url" className="form-input" placeholder="https://example.com/banner.jpg" value={formData.banner_image} onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #1E293B', paddingTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>{actionLoading ? 'Creating...' : 'Stage Draft Poll'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT POLL MODAL */}
      {editModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(3, 7, 18, 0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ maxWidth: '640px', width: '100%', backgroundColor: '#0F172A', borderRadius: '1rem', border: '1px solid #334155', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1E293B' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC' }}>Edit Poll #{activePoll?.id}</h3>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdatePoll} style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div className="form-group">
                <label className="form-label">Poll Title</label>
                <input type="text" className="form-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Results Visibility</label>
                  <select className="form-select" value={formData.results_visibility} onChange={(e) => setFormData({ ...formData, results_visibility: e.target.value })}>
                    <option value="public">Public</option>
                    <option value="hidden_until_close">Hidden Until Poll Closes</option>
                    <option value="admin_only">Admin Only</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea rows="3" className="form-textarea" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #1E293B', paddingTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANDIDATE ASSIGNMENT MODAL */}
      {candidateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(3, 7, 18, 0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ maxWidth: '640px', width: '100%', backgroundColor: '#0F172A', borderRadius: '1rem', border: '1px solid #334155', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1E293B' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC' }}>Poll Candidates: {activePoll?.title}</h3>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Assign or remove approved candidate profiles.</div>
              </div>
              <button onClick={() => setCandidateModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              {/* Form to add candidate */}
              <form onSubmit={handleAddCandidate} style={{ padding: '1.25rem', backgroundColor: '#0B1120', borderRadius: '0.75rem', border: '1px solid #1E293B', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem' }}>Add Approved Candidate</h4>
                <div className="form-group">
                  <label className="form-label">Select Candidate Profile</label>
                  <select className="form-select" value={selectedCandidateId} onChange={(e) => setSelectedCandidateId(e.target.value)}>
                    {candidatesList.map((c) => (
                      <option key={c.id} value={c.id}>{c.full_name} (@{c.username || 'unlinked'})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Campaign Statement for this Poll</label>
                  <input type="text" className="form-input" placeholder="e.g. Dedicated to clean energy standards" value={candidateStatement} onChange={(e) => setCandidateStatement(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '0.88rem' }} disabled={actionLoading}>
                  <PlusCircle size={15} /> Add to Poll
                </button>
              </form>

              {/* Current Assigned Candidates List */}
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.75rem' }}>
                Currently Assigned ({activePoll?.candidates?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activePoll?.candidates?.length === 0 ? (
                  <div style={{ color: '#64748B', fontSize: '0.85rem' }}>No candidates assigned yet. Poll cannot be published until at least 1 candidate is added.</div>
                ) : (
                  activePoll?.candidates?.map((c) => (
                    <div key={c.candidate_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{c.full_name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{c.statement || 'No statement provided'}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCandidate(activePoll.id, c.candidate_id)}
                        style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.25rem' }}
                        title="Remove from poll"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
