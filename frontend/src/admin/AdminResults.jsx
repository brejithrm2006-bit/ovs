import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { formatNumber, formatDateTime } from '../utils/formatters';
import {
  BarChart3,
  RefreshCw,
  PieChart as PieIcon,
  ShieldCheck,
  Users,
  CheckCircle2
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

export default function AdminResults() {
  const { addToast } = useNotifications();

  const [polls, setPolls] = useState([]);
  const [selectedPollId, setSelectedPollId] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const CHART_COLORS = ['#38BDF8', '#818CF8', '#34D399', '#FBBF24', '#F472B6', '#A78BFA'];

  useEffect(() => {
    async function loadPolls() {
      try {
        const res = await api.polls.list({ per_page: 50 });
        setPolls(res.polls || []);
        if (res.polls && res.polls.length > 0) {
          setSelectedPollId(res.polls[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPolls();
  }, []);

  const fetchResults = async (id) => {
    if (!id) return;
    setRefreshing(true);
    try {
      const res = await api.polls.getResults(id);
      setResults(res);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to fetch poll results.' });
      setResults(null);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedPollId) {
      fetchResults(selectedPollId);
    }
  }, [selectedPollId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.25rem' }}>
            Live Results & Tabulation Oversight
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.92rem' }}>
            Administrative direct audit of valid candidate tallies and ballot distribution.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fetchResults(selectedPollId)}
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Refresh Counts
        </button>
      </div>

      {/* Select Poll Dropdown */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
        <label className="form-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>
          Select Ballot to Inspect:
        </label>
        <select
          className="form-select"
          style={{ maxWidth: '420px' }}
          value={selectedPollId}
          onChange={(e) => setSelectedPollId(e.target.value)}
        >
          {polls.map((p) => (
            <option key={p.id} value={p.id} style={{ backgroundColor: '#0F172A', color: '#F8FAFC' }}>
              {p.title} ({p.status.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Results View */}
      {refreshing && !results ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #1E293B', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#94A3B8' }}>Calculating valid receipts from database...</p>
        </div>
      ) : !results ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
          No results available for this poll.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Summary Banner */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.2rem' }}>
                {results.title}
              </h2>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                Visibility Setting: <strong style={{ color: '#38BDF8' }}>{results.results_visibility}</strong> • Last Updated: {formatDateTime(results.last_updated)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Total Valid Votes</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34D399' }}>
                  {formatNumber(results.total_valid_votes)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Lifecycle State</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38BDF8', textTransform: 'capitalize' }}>
                  {results.status}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* Bar Chart */}
            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1.5rem' }}>
                Candidate Votes Bar Chart
              </h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results.candidate_results} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <XAxis dataKey="full_name" stroke="#64748B" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.5rem', color: '#F8FAFC' }} />
                    <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                      {results.candidate_results.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie / Share Chart */}
            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1.5rem' }}>
                Vote Share Distribution
              </h3>
              <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {results.total_valid_votes > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={results.candidate_results}
                        dataKey="votes"
                        nameKey="full_name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        label={(entry) => `${entry.full_name}: ${entry.percentage}%`}
                        fontSize={11}
                      >
                        {results.candidate_results.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.5rem', color: '#F8FAFC' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', color: '#64748B' }}>No votes recorded yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0B1120', borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Candidate</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Votes Count</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Percentage</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Visual Bar</th>
                </tr>
              </thead>
              <tbody>
                {results.candidate_results.map((c, idx) => (
                  <tr key={c.candidate_id} style={{ borderBottom: '1px solid #1E293B' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#F8FAFC' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                        {c.full_name} (@{c.username || 'unlinked'})
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#38BDF8' }}>
                      {formatNumber(c.votes)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#34D399' }}>
                      {c.percentage}%
                    </td>
                    <td style={{ padding: '1rem 1.25rem', minWidth: '180px' }}>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#1E293B', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${c.percentage}%`, height: '100%', backgroundColor: CHART_COLORS[idx % CHART_COLORS.length], borderRadius: '9999px' }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
