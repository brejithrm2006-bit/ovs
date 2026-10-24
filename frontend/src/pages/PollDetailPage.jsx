import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { formatDateTime, getTimeRemaining, formatNumber } from '../utils/formatters';
import {
  Vote,
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Share2,
  ArrowLeft,
  Shield,
  BarChart2,
  Lock,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function PollDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { addToast } = useNotifications();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [activeTab, setActiveTab] = useState('ballot'); // 'ballot' or 'results'

  // Voting Modal & State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [votingLoading, setVotingLoading] = useState(false);

  // Results State
  const [results, setResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);

  const CHART_COLORS = ['#38BDF8', '#818CF8', '#34D399', '#FBBF24', '#F472B6', '#A78BFA'];

  const fetchPollDetail = async () => {
    try {
      const res = await api.polls.get(id);
      setPoll(res.poll);
      if (res.poll.user_voted_candidate_id) {
        setSelectedCandidateId(res.poll.user_voted_candidate_id);
      }
    } catch (err) {
      console.error('Failed to load poll details:', err);
      addToast({ type: 'error', title: 'Error', message: 'Could not load poll details.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    setResultsLoading(true);
    setResultsError(null);
    try {
      const data = await api.polls.getResults(id);
      setResults(data);
    } catch (err) {
      setResultsError(err.message || 'Results are currently restricted.');
      setResults(null);
    } finally {
      setResultsLoading(false);
    }
  };

  useEffect(() => {
    fetchPollDetail();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'results') {
      fetchResults();
    }
  }, [activeTab, id]);

  const handleCastVote = async () => {
    if (!selectedCandidateId) return;
    setVotingLoading(true);
    try {
      await api.polls.vote(poll.id, selectedCandidateId);
      addToast({
        type: 'success',
        title: 'Vote Confirmed & Recorded!',
        message: 'Your cryptographic ballot receipt has been verified and committed.',
      });
      setConfirmModalOpen(false);
      // Refresh poll detail and results
      await fetchPollDetail();
      setActiveTab('results');
      await fetchResults();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Vote Submission Failed',
        message: err.message || 'An error occurred while submitting your vote.',
      });
    } finally {
      setVotingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #1E293B', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: '#94A3B8' }}>Loading ballot details...</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="container-custom" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: '#F8FAFC', marginBottom: '1rem' }}>Poll Not Found</h2>
        <Link to="/polls" className="btn btn-secondary">
          Back to Polls
        </Link>
      </div>
    );
  }

  const remaining = getTimeRemaining(poll.end_date);
  const isPollActive = poll.status === 'active';
  const selectedCandidate = poll.candidates?.find((c) => c.candidate_id === selectedCandidateId);

  return (
    <div className="container-custom" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/polls" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', textDecoration: 'none', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to all polls
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="glass-panel" style={{ borderRadius: '1.25rem', overflow: 'hidden', marginBottom: '2.5rem' }}>
        <div style={{ position: 'relative', width: '100%', height: '240px', backgroundColor: '#1E293B' }}>
          <img
            src={poll.banner_image || 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200&auto=format&fit=crop&q=80'}
            alt={poll.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11, 17, 32, 0.95) 0%, rgba(11, 17, 32, 0.4) 60%, rgba(11, 17, 32, 0) 100%)' }} />

          <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge ${poll.status === 'active' ? 'badge-active' : poll.status === 'closed' ? 'badge-closed' : 'badge-upcoming'}`}>
              {poll.status.toUpperCase()}
            </span>
            <span className="badge badge-category">{poll.category}</span>
            <span className="badge" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', color: '#CBD5E1', border: '1px solid #334155' }}>
              Results: {poll.results_visibility.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '1rem', lineHeight: 1.25 }}>
            {poll.title}
          </h1>

          <p style={{ color: '#CBD5E1', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '880px' }}>
            {poll.description}
          </p>

          {/* Meta specs row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', padding: '1rem 1.25rem', backgroundColor: '#0B1120', borderRadius: '0.75rem', border: '1px solid #1E293B', fontSize: '0.88rem', color: '#94A3B8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} color="#38BDF8" />
              <span>Closes: <strong style={{ color: '#F8FAFC' }}>{formatDateTime(poll.end_date)}</strong> ({remaining.text})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={16} color="#38BDF8" />
              <span>Candidates: <strong style={{ color: '#F8FAFC' }}>{poll.candidates?.length || 0}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#34D399" />
              <span>Total Votes: <strong style={{ color: '#F8FAFC' }}>{formatNumber(poll.total_votes)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Already Voted Banner */}
      {poll.has_voted && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0 }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#34D399', fontSize: '1.05rem' }}>
              You have already voted in this poll
            </div>
            <div style={{ color: '#CBD5E1', fontSize: '0.88rem' }}>
              Your vote has been counted. Each voter holds strictly one atomic vote per poll to ensure election integrity.
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #1E293B', marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('ballot')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'ballot' ? '3px solid #38BDF8' : '3px solid transparent',
            color: activeTab === 'ballot' ? '#38BDF8' : '#94A3B8',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Vote size={18} /> Official Ballot
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('results')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'results' ? '3px solid #38BDF8' : '3px solid transparent',
            color: activeTab === 'results' ? '#38BDF8' : '#94A3B8',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <BarChart2 size={18} /> Live Results
        </button>
      </div>

      {/* TAB 1: OFFICIAL BALLOT */}
      {activeTab === 'ballot' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.25rem' }}>
              Candidate Nominees
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
              Select a candidate below to prepare your ballot submission.
            </p>
          </div>

          {!poll.candidates || poll.candidates.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
              No candidates have been assigned to this poll yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {poll.candidates.map((cand) => {
                const isSelected = selectedCandidateId === cand.candidate_id;
                const userVotedForThis = poll.user_voted_candidate_id === cand.candidate_id;

                return (
                  <div
                    key={cand.candidate_id}
                    className="glass-panel"
                    style={{
                      padding: '1.5rem',
                      borderRadius: '1rem',
                      border: isSelected ? '2px solid #38BDF8' : '1px solid #334155',
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'rgba(15, 23, 42, 0.75)',
                      cursor: !poll.has_voted && isPollActive ? 'pointer' : 'default',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => {
                      if (!poll.has_voted && isPollActive) {
                        setSelectedCandidateId(cand.candidate_id);
                      }
                    }}
                  >
                    {/* Selected Indicator */}
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          backgroundColor: '#2563EB',
                          color: '#FFFFFF',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <CheckCircle2 size={14} /> {userVotedForThis ? 'Your Vote' : 'Selected'}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                      <img
                        src={cand.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                        alt={cand.full_name}
                        style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #38BDF8' }}
                      />
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC' }}>
                          {cand.full_name}
                        </h3>
                        {cand.username && (
                          <div style={{ fontSize: '0.85rem', color: '#38BDF8' }}>
                            @{cand.username}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ flex: 1, marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                        {cand.biography}
                      </div>

                      {cand.statement && (
                        <div style={{ padding: '0.75rem', backgroundColor: '#0B1120', borderRadius: '0.5rem', borderLeft: '3px solid #38BDF8', fontSize: '0.82rem', color: '#94A3B8', fontStyle: 'italic' }}>
                          "{cand.statement}"
                        </div>
                      )}
                    </div>

                    {/* Radio Button / Select Trigger */}
                    {!poll.has_voted && isPollActive && (
                      <button
                        type="button"
                        className={isSelected ? 'btn btn-primary' : 'btn btn-secondary'}
                        style={{ width: '100%', padding: '0.65rem', fontSize: '0.9rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidateId(cand.candidate_id);
                        }}
                      >
                        {isSelected ? 'Candidate Selected' : 'Choose this Candidate'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Callout Bar */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem 2rem',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#F8FAFC', marginBottom: '0.2rem' }}>
                {selectedCandidate ? `Ready to vote for ${selectedCandidate.full_name}?` : 'Select a candidate above to proceed'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                {poll.has_voted
                  ? 'Your vote has already been submitted for this ballot.'
                  : !isPollActive
                  ? 'Voting is not active for this poll at this time.'
                  : 'Requires one-click modal confirmation before atomic ballot commitment.'}
              </div>
            </div>

            <div>
              {!isAuthenticated ? (
                <Link to="/login" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                  Log In to Vote
                </Link>
              ) : poll.has_voted ? (
                <button type="button" className="btn btn-secondary" disabled>
                  Vote Already Cast
                </button>
              ) : !isPollActive ? (
                <button type="button" className="btn btn-secondary" disabled>
                  Poll {poll.status.toUpperCase()}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}
                  disabled={!selectedCandidateId}
                  onClick={() => setConfirmModalOpen(true)}
                >
                  Confirm & Submit Vote
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE RESULTS */}
      {activeTab === 'results' && (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC' }}>
                Ballot Results & Analytics
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem' }}>
                Calculated from genuine confirmed database receipts.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={fetchResults}
              disabled={resultsLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} className={resultsLoading ? 'animate-spin' : ''} /> Refresh Live Results
            </button>
          </div>

          {resultsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #1E293B', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
              <p style={{ color: '#94A3B8' }}>Tabulating valid votes...</p>
            </div>
          ) : resultsError ? (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: 'rgba(30, 41, 59, 0.4)',
                borderRadius: '0.75rem',
                border: '1px solid #334155',
              }}
            >
              <Lock size={36} color="#F59E0B" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.15rem', color: '#F8FAFC', marginBottom: '0.5rem' }}>Results Restricted</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
                {resultsError}
              </p>
            </div>
          ) : !results || results.candidate_results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
              No votes have been recorded for this poll yet.
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#CBD5E1', fontSize: '0.9rem' }}>
                <div>Total Valid Votes: <strong style={{ color: '#38BDF8', fontSize: '1.1rem' }}>{formatNumber(results.total_valid_votes)}</strong></div>
                <div>Status: <strong style={{ color: '#10B981', textTransform: 'capitalize' }}>{results.status}</strong></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                {/* Bar Chart */}
                <div style={{ height: '320px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results.candidate_results} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                      <XAxis dataKey="full_name" stroke="#64748B" fontSize={12} interval={0} angle={-15} textAnchor="end" />
                      <YAxis stroke="#64748B" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.5rem', color: '#F8FAFC' }}
                        formatter={(val) => [`${val} votes`, 'Votes']}
                      />
                      <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                        {results.candidate_results.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Progress breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {results.candidate_results.map((cand, idx) => (
                    <div key={cand.candidate_id} style={{ padding: '1rem', backgroundColor: '#0B1120', borderRadius: '0.75rem', border: '1px solid #1E293B' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                          <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{cand.full_name}</span>
                        </div>
                        <div style={{ fontWeight: 700, color: '#38BDF8' }}>
                          {cand.percentage}% <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 400 }}>({cand.votes} votes)</span>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#1E293B', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${cand.percentage}%`, height: '100%', backgroundColor: CHART_COLORS[idx % CHART_COLORS.length], borderRadius: '9999px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleCastVote}
        title="Confirm Your Official Vote"
        message={`Are you sure you want to cast your ballot for ${selectedCandidate?.full_name}?`}
        confirmText="Confirm Vote"
        cancelText="Review Selection"
        type="primary"
        loading={votingLoading}
      >
        <div style={{ padding: '0.85rem', backgroundColor: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '0.5rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
          <strong>Notice:</strong> This action commits your single official vote for poll <em>"{poll.title}"</em>. Once recorded, submitted ballots cannot be altered or re-cast.
        </div>
      </ConfirmationModal>
    </div>
  );
}
