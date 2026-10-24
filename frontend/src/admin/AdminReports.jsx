import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatNumber, formatDateTime } from '../utils/formatters';
import { TableSkeleton } from '../components/LoadingSkeleton';
import {
  FileText,
  ShieldCheck,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  Database
} from 'lucide-react';

export default function AdminReports() {
  const [report, setReport] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const [repRes, logsRes] = await Promise.all([
          api.admin.getReportsOverview(),
          api.admin.getAuditLogs(),
        ]);
        setReport(repRes);
        setAuditLogs(logsRes.audit_logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #1E293B', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: '#94A3B8' }}>Compiling analytical integrity reports...</p>
      </div>
    );
  }

  const summary = report?.summary || {};
  const catDist = report?.category_distribution || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.25rem' }}>
            System Audit & Election Reports
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.92rem' }}>
            Comprehensive verification metrics and tamper-evident audit trail for institutional review.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handlePrint}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Download size={16} /> Print / Export Report
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: '0.35rem' }}>Total Elections Staged</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38BDF8' }}>{summary.total_polls || 0}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: '0.35rem' }}>Total Valid Ballots Cast</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981' }}>{summary.total_votes_cast || 0}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: '0.35rem' }}>Avg Votes per Ballot</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FBBF24' }}>{summary.average_votes_per_poll || 0}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: '0.35rem' }}>Voter Participation Base</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818CF8' }}>{summary.voters_count || 0}</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '1rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1rem' }}>
          Ballots Categorical Distribution
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {catDist.map((item, idx) => (
            <div key={idx} style={{ padding: '1rem', backgroundColor: '#0B1120', borderRadius: '0.65rem', border: '1px solid #1E293B' }}>
              <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{item.category}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F8FAFC', marginTop: '0.25rem' }}>
                {item.count} <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>ballots</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Audit Trail */}
      <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1E293B' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC' }}>
            Permanent Audit Trail Records ({auditLogs.length})
          </h3>
          <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            Chronological cryptographic log of every administrative decision and status transition.
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0B1120', borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Admin User</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Action Code</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Target Entity</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Action Notes / Target ID</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>IP Address</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #1E293B' }}>
                  <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: '#F8FAFC' }}>
                    @{log.admin_username}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <span className="badge badge-active">{log.action}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', color: '#CBD5E1' }}>
                    {log.target_type}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', color: '#94A3B8', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {log.details || `ID: #${log.target_id}`}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', color: '#64748B', fontSize: '0.8rem' }}>
                    {log.ip_address || '127.0.0.1'}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', color: '#64748B', fontSize: '0.8rem' }}>
                    {formatDateTime(log.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
