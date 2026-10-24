import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { formatDateTime } from '../utils/formatters';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Users,
  Shield,
  X,
  ExternalLink
} from 'lucide-react';

export default function AdminPollRequests() {
  const { addToast } = useNotifications();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const [viewReq, setViewReq] = useState(null);
  const [actionReq, setActionReq] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve', 'reject', 'more_info'
  const [decisionNotes, setDecisionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPollRequests = async () => {
    setLoading(true);
    try {
      const res = await api.pollRequests.adminList(statusFilter === 'All' ? null : statusFilter);
      setRequests(res.poll_requests || []);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', message: 'Could not load poll requests.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPollRequests();
  }, [statusFilter]);

  const handleActionConfirm = async () => {
    if (!actionReq || !actionType) return;
    setActionLoading(true);
    try {
      if (actionType === 'approve') {
        const res = await api.pollRequests.adminApprove(actionReq.id, decisionNotes || 'Approved by administrator.');
        addToast({
          type: 'success',
          title: 'Poll Request Approved',
          message: `Draft poll #${res.created_poll_id} has been staged for candidate curation!`,
        });
      } else if (actionType === 'reject') {
        await api.pollRequests.adminReject(actionReq.id, decisionNotes || 'Rejected.');
        addToast({ type: 'info', title: 'Poll Request Rejected', message: 'Requester has been notified.' });
      } else if (actionType === 'more_info') {
        await api.pollRequests.adminRequestInfo(actionReq.id, decisionNotes || 'Additional details required.');
        addToast({ type: 'info', title: 'Information Requested', message: 'Request sent to applicant.' });
      }

      setActionReq(null);
      setActionType(null);
      setDecisionNotes('');
      fetchPollRequests();
    } catch (err) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.25rem' }}>
          Community Poll Proposals
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.92rem' }}>
          Evaluate grassroots elections proposed by registered voters, review suggested nominees, and authorize staging.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>Filter by Status:</span>
        {['All', 'pending', 'approved', 'rejected', 'more_info'].map((st) => (
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

      {loading ? (
        <TableSkeleton rows={5} />
      ) : requests.length === 0 ? (
        <EmptyState title="No poll requests found" description="There are currently no community poll proposals with this status." />
      ) : (
        <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0B1120', borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Req ID</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Proposed Title</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Requester</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Category</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Nominees</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Submitted At</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #1E293B' }}>
                    <td style={{ padding: '1rem 1.25rem', color: '#38BDF8', fontWeight: 600 }}>
                      #{req.id}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#F8FAFC', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {req.proposed_title}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{req.requester_full_name || req.requester_username}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>@{req.requester_username} • {req.requester_phone || 'Private'}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="badge badge-category">{req.category}</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#38BDF8', fontWeight: 600 }}>
                      {req.proposed_candidates?.length || 0}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${req.status === 'approved' ? 'badge-active' : req.status === 'rejected' ? 'badge-closed' : 'badge-pending'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.8rem' }}>
                      {formatDateTime(req.created_at)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => setViewReq(req)}
                        >
                          <Eye size={14} /> Review
                        </button>

                        {req.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-success"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                              onClick={() => { setActionReq(req); setActionType('approve'); }}
                              title="Approve & Stage Poll"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                              onClick={() => { setActionReq(req); setActionType('reject'); }}
                              title="Reject Proposal"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {req.created_poll_id && (
                          <Link
                            to={`/polls/${req.created_poll_id}`}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            title="View Generated Poll"
                          >
                            <ExternalLink size={14} />
                          </Link>
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

      {/* VIEW PROPOSAL MODAL */}
      {viewReq && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(3, 7, 18, 0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ maxWidth: '680px', width: '100%', backgroundColor: '#0F172A', borderRadius: '1rem', border: '1px solid #334155', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1E293B' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC' }}>Poll Proposal #{viewReq.id}</h3>
                <div style={{ fontSize: '0.8rem', color: '#38BDF8' }}>Category: {viewReq.category}</div>
              </div>
              <button onClick={() => setViewReq(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Proposed Title</h4>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC' }}>{viewReq.proposed_title}</div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Description & Community Rules</h4>
                <div style={{ padding: '0.85rem', backgroundColor: '#0B1120', borderRadius: '0.5rem', color: '#CBD5E1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {viewReq.description}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Purpose / Reason</h4>
                <div style={{ padding: '0.85rem', backgroundColor: '#0B1120', borderRadius: '0.5rem', color: '#CBD5E1', fontSize: '0.9rem' }}>
                  {viewReq.reason}
                </div>
              </div>

              {/* Proposed Candidate Nominees */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={16} /> Proposed Candidate Nominees ({viewReq.proposed_candidates?.length || 0})
                </h4>

                {(!viewReq.proposed_candidates || viewReq.proposed_candidates.length === 0) ? (
                  <div style={{ color: '#64748B', fontSize: '0.85rem' }}>No proposed candidates provided in this request.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {viewReq.proposed_candidates.map((cand, idx) => (
                      <div key={idx} style={{ padding: '0.85rem 1rem', backgroundColor: '#0B1120', borderRadius: '0.5rem', border: '1px solid #1E293B', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 700, color: '#F8FAFC' }}>{cand.full_name}</span>
                          <span style={{ color: '#38BDF8' }}>@{cand.username || 'unregistered'}</span>
                        </div>
                        {cand.phone && (
                          <div style={{ color: '#CBD5E1', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                            Private Phone: {cand.phone}
                          </div>
                        )}
                        {cand.introduction && (
                          <div style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.82rem' }}>
                            "{cand.introduction}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewReq(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={!!actionReq}
        onClose={() => { setActionReq(null); setActionType(null); }}
        onConfirm={handleActionConfirm}
        title={actionType === 'approve' ? 'Approve & Stage Draft Poll' : 'Reject Poll Proposal'}
        message={`Are you sure you want to ${actionType} the poll proposal "${actionReq?.proposed_title}" from @${actionReq?.requester_username}?`}
        confirmText={actionType === 'approve' ? 'Approve & Create Draft' : 'Reject'}
        type={actionType === 'approve' ? 'success' : 'danger'}
        loading={actionLoading}
      >
        <div style={{ marginTop: '1rem' }}>
          <label className="form-label">Decision Note / Feedback for Requester</label>
          <textarea
            rows="3"
            className="form-textarea"
            placeholder="Feedback note that will be stored with this request..."
            value={decisionNotes}
            onChange={(e) => setDecisionNotes(e.target.value)}
          />
        </div>
      </ConfirmationModal>
    </div>
  );
}
