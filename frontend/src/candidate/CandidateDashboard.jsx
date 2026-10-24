import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ApplyPollModal from './ApplyPollModal';
import RequestPollModal from './RequestPollModal';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { formatDateTime } from '../utils/formatters';
import {
  Award,
  PlusCircle,
  FileCheck,
  GitPullRequest,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function CandidateDashboard() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [pollRequests, setPollRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' or 'requests'

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsRes, reqsRes] = await Promise.all([
        api.applications.getMy(),
        api.pollRequests.getMy(),
      ]);
      setApplications(appsRes.applications || []);
      setPollRequests(reqsRes.poll_requests || []);
    } catch (err) {
      console.error('Failed to load candidate portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approvedCount = applications.filter((a) => a.status === 'approved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          borderRadius: '1.25rem',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ color: '#FBBF24', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
              Candidate Operations Hub
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.5rem' }}>
              Candidate Portal: {user?.full_name}
            </h1>
            <p style={{ color: '#CBD5E1', fontSize: '0.95rem', maxWidth: '620px' }}>
              Manage your verified campaign platforms, submit candidacy nominations to upcoming ballots, or propose community polls.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setApplyModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileCheck size={16} color="#38BDF8" /> Apply to Existing Poll
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setRequestModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <PlusCircle size={16} /> Propose New Poll
            </button>
          </div>
        </div>

        {/* Status Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginTop: '2rem', borderTop: '1px solid rgba(51, 65, 85, 0.6)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8' }}>
              <FileCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>
                {applications.length}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Applications Submitted</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34D399' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>
                {approvedCount}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Approved Candidacies</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FBBF24' }}>
              <GitPullRequest size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>
                {pollRequests.length}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Poll Proposals Staged</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #1E293B' }}>
        <button
          type="button"
          onClick={() => setActiveTab('applications')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'applications' ? '3px solid #38BDF8' : '3px solid transparent',
            color: activeTab === 'applications' ? '#38BDF8' : '#94A3B8',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FileCheck size={18} /> My Candidacy Applications ({applications.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'requests' ? '3px solid #38BDF8' : '3px solid transparent',
            color: activeTab === 'requests' ? '#38BDF8' : '#94A3B8',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <GitPullRequest size={18} /> My Proposed Polls ({pollRequests.length})
        </button>
      </div>

      {/* Tab 1: Applications */}
      {activeTab === 'applications' && (
        <div>
          {loading ? (
            <TableSkeleton rows={4} />
          ) : applications.length === 0 ? (
            <EmptyState
              icon={FileCheck}
              title="No candidacy applications submitted"
              description="Apply to an active community election to represent your department or group."
              actionLabel="Apply to Open Poll"
              onAction={() => setApplyModalOpen(true)}
            />
          ) : (
            <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0B1120', borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>Poll Title</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Statement Summary</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Admin Feedback</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Submitted At</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} style={{ borderBottom: '1px solid #1E293B' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#F8FAFC' }}>
                          {app.poll_title}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#CBD5E1', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {app.introduction}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span className={`badge ${app.status === 'approved' ? 'badge-active' : app.status === 'rejected' ? 'badge-closed' : 'badge-pending'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#94A3B8', fontSize: '0.85rem' }}>
                          {app.admin_notes || 'Pending administrative review'}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.82rem' }}>
                          {formatDateTime(app.created_at)}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <Link to={`/polls/${app.poll_id}`} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                            View Ballot
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Poll Proposals */}
      {activeTab === 'requests' && (
        <div>
          {loading ? (
            <TableSkeleton rows={4} />
          ) : pollRequests.length === 0 ? (
            <EmptyState
              icon={GitPullRequest}
              title="No poll requests staged"
              description="Propose a new voting topic for community consideration."
              actionLabel="Propose New Poll"
              onAction={() => setRequestModalOpen(true)}
            />
          ) : (
            <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0B1120', borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>Proposed Title</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Category</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Nominees</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Review Status</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Admin Notes</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Linked Poll</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pollRequests.map((req) => (
                      <tr key={req.id} style={{ borderBottom: '1px solid #1E293B' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#F8FAFC' }}>
                          {req.proposed_title}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span className="badge badge-category">{req.category}</span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#38BDF8' }}>
                          {req.proposed_candidates?.length || 0} nominees
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span className={`badge ${req.status === 'approved' ? 'badge-active' : req.status === 'rejected' ? 'badge-closed' : 'badge-pending'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#94A3B8', fontSize: '0.85rem' }}>
                          {req.admin_notes || 'Under review'}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          {req.created_poll_id ? (
                            <Link to={`/polls/${req.created_poll_id}`} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                              View Poll
                            </Link>
                          ) : (
                            <span style={{ color: '#64748B', fontSize: '0.8rem' }}>Not created yet</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ApplyPollModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSuccess={loadData}
      />

      <RequestPollModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
