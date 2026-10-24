import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatNumber, formatDateTime } from '../utils/formatters';
import {
  Users,
  Radio,
  Award,
  FileCheck,
  CheckCircle2,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Activity,
  Plus
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

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const CHART_COLORS = ['#38BDF8', '#818CF8', '#34D399', '#FBBF24', '#F472B6', '#A78BFA'];

  useEffect(() => {
    async function loadAdminOverview() {
      try {
        const res = await api.admin.getOverview();
        setData(res);
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminOverview();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #1E293B', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: '#94A3B8' }}>Loading administrative intelligence...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recentLogs = data?.recent_logs || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.25rem' }}>
            Executive Overview
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.92rem' }}>
            High-level platform governance, real-time balloting health, and security telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/polls" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
            <Plus size={16} /> Create Official Poll
          </Link>
          <Link to="/admin/news" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
            Publish Bulletin
          </Link>
        </div>
      </div>

      {/* 6 Metric KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid #38BDF8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>Total Registered Voters</span>
            <Users size={18} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC' }}>
            {formatNumber(stats.total_voters)}
          </div>
          <Link to="/admin/voters" style={{ fontSize: '0.75rem', color: '#38BDF8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.5rem' }}>
            Manage Voters <ArrowRight size={12} />
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>Active Ballots</span>
            <Radio size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC' }}>
            {formatNumber(stats.active_polls)}
          </div>
          <Link to="/admin/polls" style={{ fontSize: '0.75rem', color: '#10B981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.5rem' }}>
            Review Polls <ArrowRight size={12} />
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid #818CF8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>Official Candidates</span>
            <Award size={18} color="#818CF8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC' }}>
            {formatNumber(stats.total_candidates)}
          </div>
          <Link to="/admin/candidates" style={{ fontSize: '0.75rem', color: '#818CF8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.5rem' }}>
            Manage Candidates <ArrowRight size={12} />
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>Pending Applications</span>
            <FileCheck size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC' }}>
            {formatNumber(stats.pending_applications)}
          </div>
          <Link to="/admin/applications" style={{ fontSize: '0.75rem', color: '#F59E0B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.5rem' }}>
            Review Applications <ArrowRight size={12} />
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid #34D399' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>Confirmed Votes Cast</span>
            <CheckCircle2 size={18} color="#34D399" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC' }}>
            {formatNumber(stats.total_votes)}
          </div>
          <Link to="/admin/results" style={{ fontSize: '0.75rem', color: '#34D399', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.5rem' }}>
            Inspect Results <ArrowRight size={12} />
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid #F472B6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>Unread Inquiries</span>
            <MessageSquare size={18} color="#F472B6" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC' }}>
            {formatNumber(stats.unread_messages)}
          </div>
          <Link to="/admin/messages" style={{ fontSize: '0.75rem', color: '#F472B6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.5rem' }}>
            View Messages <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Chart 1: Votes by Poll */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.25rem' }}>
            Ballot Participation Volume
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
            Total confirmed ballots cast per active/recent poll.
          </p>

          <div style={{ height: '260px', width: '100%' }}>
            {charts.votes_by_poll && charts.votes_by_poll.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.votes_by_poll} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis dataKey="title" stroke="#64748B" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.5rem', color: '#F8FAFC' }}
                    formatter={(val) => [`${val} votes`, 'Total Votes']}
                  />
                  <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                    {charts.votes_by_poll.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748B', paddingTop: '5rem' }}>No voting data recorded yet.</div>
            )}
          </div>
        </div>

        {/* Chart 2: Poll Status Breakdown */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.25rem' }}>
            Poll Lifecycle Status
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
            Distribution of polls across draft, upcoming, active, and closed phases.
          </p>

          <div style={{ height: '260px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {charts.poll_status_breakdown && charts.poll_status_breakdown.some(s => s.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.poll_status_breakdown.filter(s => s.count > 0)}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                    fontSize={12}
                  >
                    {charts.poll_status_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.5rem', color: '#F8FAFC' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748B' }}>No poll status records.</div>
            )}
          </div>
        </div>
      </div>

      {/* Administrative Audit Trail Table */}
      <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} color="#38BDF8" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC' }}>
              Security & Action Audit Log
            </h3>
          </div>
          <Link to="/admin/reports" style={{ fontSize: '0.82rem', color: '#38BDF8', textDecoration: 'none' }}>
            View Full Reports &rarr;
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0B1120', borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Admin User</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Action Code</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Target Entity</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Details</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                    No audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                recentLogs.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #1E293B' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: '#F8FAFC' }}>
                      @{log.admin_username}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <span className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: '#CBD5E1' }}>
                      {log.target_type} {log.target_id ? `#${log.target_id}` : ''}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: '#94A3B8', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.details || '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: '#64748B', fontSize: '0.8rem' }}>
                      {formatDateTime(log.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
