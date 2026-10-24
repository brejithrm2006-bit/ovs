import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { formatDateTime } from '../utils/formatters';
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminVoters() {
  const { addToast } = useNotifications();

  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [targetUser, setTargetUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVoters = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getVoters({ page, per_page: 15, search });
      setVoters(res.voters || []);
      setTotalPages(res.pages || 1);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', message: 'Could not load voters registry.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters();
  }, [page]);

  const handleToggleStatus = async () => {
    if (!targetUser) return;
    setActionLoading(true);
    try {
      const res = await api.admin.toggleVoterStatus(targetUser.id);
      addToast({
        type: 'success',
        title: 'User Status Updated',
        message: res.message,
      });
      setTargetUser(null);
      fetchVoters();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Could not toggle user status.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.25rem' }}>
            Voter & Account Governance
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.92rem' }}>
            Inspect registered accounts, verify single-account policies, and manage account authorization.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchVoters(); }} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by username, name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '280px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            <Search size={16} />
          </button>
        </form>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : voters.length === 0 ? (
        <EmptyState title="No voter accounts found" description="Adjust your search criteria." />
      ) : (
        <div className="glass-panel" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0B1120', borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>User Profile</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Verified Phone</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Role</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Ballots Cast</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Account Status</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Joined Date</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Authorization</th>
                </tr>
              </thead>
              <tbody>
                {voters.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #1E293B' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#1E293B', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#38BDF8', fontSize: '0.85rem' }}>
                          {u.full_name ? u.full_name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{u.full_name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#38BDF8' }}>@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#CBD5E1', fontSize: '0.85rem' }}>
                      {u.phone || '—'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-active' : u.role === 'candidate' ? 'badge-category' : 'badge-upcoming'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#34D399', fontWeight: 600 }}>
                      {u.votes_count || 0} votes
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${u.is_active ? 'badge-active' : 'badge-closed'}`}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.8rem' }}>
                      {formatDateTime(u.created_at)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        <button
                          type="button"
                          className={u.is_active ? 'btn btn-secondary' : 'btn btn-success'}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                          onClick={() => setTargetUser(u)}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem', borderTop: '1px solid #1E293B' }}>
              <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={16} /> Previous
              </button>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Page {page} of {totalPages}</span>
              <button type="button" className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={!!targetUser}
        onClose={() => setTargetUser(null)}
        onConfirm={handleToggleStatus}
        title={targetUser?.is_active ? 'Deactivate Voter Account' : 'Re-activate Voter Account'}
        message={`Are you sure you want to ${targetUser?.is_active ? 'deactivate' : 'activate'} the account for @${targetUser?.username} (${targetUser?.full_name})?`}
        confirmText={targetUser?.is_active ? 'Deactivate' : 'Activate'}
        type={targetUser?.is_active ? 'danger' : 'success'}
        loading={actionLoading}
      />
    </div>
  );
}
