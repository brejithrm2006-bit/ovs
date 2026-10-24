import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import PollCard from '../components/PollCard';
import { CardSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { formatDateTime, formatDate } from '../utils/formatters';
import {
  Vote,
  CheckCircle2,
  Clock,
  Award,
  Bell,
  ArrowRight,
  Calendar,
  History,
  FileCheck
} from 'lucide-react';

export default function VoterDashboard() {
  const { user } = useAuth();
  const [activePolls, setActivePolls] = useState([]);
  const [voterHistory, setVoterHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

  useEffect(() => {
    async function loadVoterData() {
      setLoading(true);
      try {
        const [pollsRes, historyRes] = await Promise.all([
          api.public.getActive(),
          api.polls.getVoterHistory(),
        ]);
        setActivePolls(pollsRes.polls || []);
        setVoterHistory(historyRes.history || []);
      } catch (err) {
        console.error('Failed to load voter dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVoterData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Welcome Hero Card */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          borderRadius: '1.25rem',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
              Verified Voter Hub
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.5rem' }}>
              Welcome, {user?.full_name}!
            </h1>
            <p style={{ color: '#CBD5E1', fontSize: '0.95rem', maxWidth: '600px' }}>
              Review active community elections, submit your official ballots, and monitor your personal participation receipts.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/candidate" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Award size={16} color="#FBBF24" /> Apply as Candidate
            </Link>
            <Link to="/polls" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Explore All Polls <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginTop: '2rem', borderTop: '1px solid rgba(51, 65, 85, 0.6)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8' }}>
              <Vote size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>
                {activePolls.length}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Available Active Polls</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34D399' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>
                {voterHistory.length}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Ballots Cast by You</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #1E293B' }}>
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'active' ? '3px solid #38BDF8' : '3px solid transparent',
            color: activeTab === 'active' ? '#38BDF8' : '#94A3B8',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Vote size={18} /> Active Community Ballots ({activePolls.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'history' ? '3px solid #38BDF8' : '3px solid transparent',
            color: activeTab === 'history' ? '#38BDF8' : '#94A3B8',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <History size={18} /> My Voting History ({voterHistory.length})
        </button>
      </div>

      {/* Tab 1: Active Polls */}
      {activeTab === 'active' && (
        <div>
          {loading ? (
            <CardSkeleton count={3} />
          ) : activePolls.length === 0 ? (
            <EmptyState title="No active polls right now" description="There are currently no active ballots taking votes. Check back soon!" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
              {activePolls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Voter History Receipts */}
      {activeTab === 'history' && (
        <div>
          {loading ? (
            <TableSkeleton rows={4} />
          ) : voterHistory.length === 0 ? (
            <EmptyState
              icon={History}
              title="No voting history yet"
              description="You have not cast any votes in community ballots. Explore open polls to participate!"
              actionLabel="View Open Polls"
              onAction={() => setActiveTab('active')}
            />
          ) : (
            <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0B1120', borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>Poll Title</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Candidate Voted For</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Poll Status</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Submission Timestamp</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voterHistory.map((h) => (
                      <tr key={h.vote_id} style={{ borderBottom: '1px solid #1E293B', transition: 'background-color 0.15s' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#F8FAFC' }}>
                          {h.poll_title}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#38BDF8', fontWeight: 600 }}>
                          {h.candidate_name}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span className={`badge ${h.poll_status === 'active' ? 'badge-active' : 'badge-closed'}`}>
                            {h.poll_status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#CBD5E1', fontSize: '0.85rem' }}>
                          {formatDateTime(h.voted_at)}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <Link to={`/polls/${h.poll_id}`} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
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
    </div>
  );
}
