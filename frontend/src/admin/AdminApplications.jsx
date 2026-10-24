import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { formatDateTime } from '../utils/formatters';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Phone,
  User,
  Shield,
  X
} from 'lucide-react';

export default function AdminApplications() {
  const { addToast } = useNotifications();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [viewApp, setViewApp] = useState(null);
  const [actionApp, setActionApp] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve', 'reject', 'more_info'
  const [decisionNotes, setDecisionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.applications.adminList(statusFilter === 'All' ? null : statusFilter);
      setApplications(res.applications || []);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', message: 'Could not load applications.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleActionConfirm = async () => {
    if (!actionApp || !actionType) return;
    setActionLoading(true);
    try {
      if (actionType === 'approve') {
        await api.applications.adminApprove(actionApp.id, decisionNotes || 'Approved by administrator.');
        addToast({ type: 'success', title: 'Application Approved', message: `@${actionApp.applicant_username} is now an official candidate in this poll.` });
      } else if (actionType === 'reject') {
        await api.applications.adminReject(actionApp.id, decisionNotes || 'Did not meet criteria.');
        addToast({ type: 'info', title: 'Application Rejected', message: 'Status updated to rejected.' });
      } else if (actionType === 'more_info') {
        await api.applications.adminRequestInfo(actionApp.id, decisionNotes || 'Additional verification needed.');
        addToast({ type: 'info', title: 'Information Requested', message: 'Applicant notified inside the platform.' });
      }

      setActionApp(null);
      setActionType(null);
      setDecisionNotes('');
      fetchApplications();
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
          Candidate Application Review
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.92rem' }}>
          Review prospective candidate nominations, inspect verification credentials, and authorize poll participation.
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
      ) : applications.length === 0 ? (
        <EmptyState title="No applications match this filter" description="There are currently no candidate applications with the selected status." />
      ) : (
        <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0B1120', borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>App ID</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Applicant</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Applicant Phone</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Target Poll</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Submitted At</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Review Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #1E293B' }}>
                    <td style={{ padding: '1rem 1.25rem', color: '#38BDF8', fontWeight: 600 }}>
                      #{app.id}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{app.applicant_full_name || app.applicant_username}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>@{app.applicant_username}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#CBD5E1', fontSize: '0.85rem' }}>
                      {app.applicant_phone || '—'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#F8FAFC', fontWeight: 500, maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {app.poll_title}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${app.status === 'approved' ? 'badge-active' : app.status === 'rejected' ? 'badge-closed' : 'badge-pending'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.8rem' }}>
                      {formatDateTime(app.created_at)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => setViewApp(app)}
                          title="View Full Application"
                        >
                          <Eye size={14} /> View
                        </button>

                        {app.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-success"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                              onClick={() => { setActionApp(app); setActionType('approve'); }}
                              title="Approve & Link to Poll"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: '#FBBF24' }}
                              onClick={() => { setActionApp(app); setActionType('more_info'); }}
                              title="Request Info"
                            >
                              Request Info
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                              onClick={() => { setActionApp(app); setActionType('reject'); }}
                              title="Reject Application"
                            >
                              Reject
                            </button>
                          </>
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

      {/* VIEW DETAILS MODAL */}
      {viewApp && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(3, 7, 18, 0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ maxWidth: '620px', width: '100%', backgroundColor: '#0F172A', borderRadius: '1rem', border: '1px solid #334155', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1E293B' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC' }}>Application #{viewApp.id} Dossier</h3>
                <div style={{ fontSize: '0.8rem', color: '#38BDF8' }}>Target Poll: {viewApp.poll_title}</div>
              </div>
              <button onClick={() => setViewApp(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', backgroundColor: '#0B1120', borderRadius: '0.65rem', border: '1px solid #1E293B', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <div>Applicant: <strong style={{ color: '#F8FAFC' }}>{viewApp.applicant_full_name}</strong> (@{viewApp.applicant_username})</div>
                <div>Private Phone: <strong style={{ color: '#38BDF8' }}>{viewApp.applicant_phone}</strong></div>
                <div>Status: <span className="badge badge-active">{viewApp.status}</span></div>
                <div>Submitted: <span style={{ color: '#94A3B8' }}>{formatDateTime(viewApp.created_at)}</span></div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.4rem' }}>Candidate Vision / Platform</h4>
                <div style={{ padding: '0.85rem', backgroundColor: '#0B1120', borderRadius: '0.5rem', color: '#CBD5E1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {viewApp.introduction}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.4rem' }}>Reason for Candidacy</h4>
                <div style={{ padding: '0.85rem', backgroundColor: '#0B1120', borderRadius: '0.5rem', color: '#CBD5E1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {viewApp.reason}
                </div>
              </div>

              {viewApp.supporting_info && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.4rem' }}>Supporting Qualifications</h4>
                  <div style={{ padding: '0.85rem', backgroundColor: '#0B1120', borderRadius: '0.5rem', color: '#CBD5E1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {viewApp.supporting_info}
                  </div>
                </div>
              )}

              {viewApp.admin_notes && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F59E0B', marginBottom: '0.4rem' }}>Administrator Decision Notes</h4>
                  <div style={{ padding: '0.85rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem', color: '#CBD5E1', fontSize: '0.85rem' }}>
                    {viewApp.admin_notes}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewApp(null)}>Close Dossier</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM ACTION MODAL */}
      <ConfirmationModal
        isOpen={!!actionApp}
        onClose={() => { setActionApp(null); setActionType(null); }}
        onConfirm={handleActionConfirm}
        title={actionType === 'approve' ? 'Authorize Candidate Nomination' : actionType === 'reject' ? 'Reject Application' : 'Request Additional Details'}
        message={`Are you sure you want to ${actionType} the application from @${actionApp?.applicant_username} for "${actionApp?.poll_title}"?`}
        confirmText={actionType === 'approve' ? 'Approve & Link' : actionType === 'reject' ? 'Reject' : 'Send Request'}
        type={actionType === 'approve' ? 'success' : actionType === 'reject' ? 'danger' : 'primary'}
        loading={actionLoading}
      >
        <div style={{ marginTop: '1rem' }}>
          <label className="form-label">Decision Note / Feedback for Applicant</label>
          <textarea
            rows="3"
            className="form-textarea"
            placeholder="Provide context or instructions that will appear in the applicant's notification center..."
            value={decisionNotes}
            onChange={(e) => setDecisionNotes(e.target.value)}
          />
        </div>
      </ConfirmationModal>
    </div>
  );
}
