import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import PollCard from '../components/PollCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { Search, Filter, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PollsPage() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const categories = ['All', 'Technology', 'Student Activities', 'Innovation', 'Sports', 'Community', 'Entertainment'];
  const statuses = ['All', 'active', 'upcoming', 'closed'];

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 9 };
      if (category !== 'All') params.category = category;
      if (status !== 'All') params.status = status;
      if (search.trim()) params.search = search.trim();

      const res = await api.polls.list(params);
      setPolls(res.polls || []);
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Error fetching polls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [category, status, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPolls();
  };

  return (
    <div className="container-custom" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.5rem' }}>
          Explore Community Ballots
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '640px' }}>
          Browse open elections, upcoming referendums, and historical community decisions.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          borderRadius: '1rem',
          marginBottom: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search polls by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search
              size={18}
              color="#64748B"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            Search
          </button>
        </form>

        {/* Filter Controls Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid #1E293B', paddingTop: '1rem' }}>
          {/* Categories */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Filter size={14} /> Category:
            </span>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { setCategory(c); setPage(1); }}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  backgroundColor: category === c ? '#2563EB' : 'rgba(30, 41, 59, 0.6)',
                  borderColor: category === c ? '#38BDF8' : '#334155',
                  color: category === c ? '#FFFFFF' : '#94A3B8',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Status Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
              Status:
            </span>
            <select
              className="form-select"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              style={{ width: 'auto', padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
            >
              {statuses.map((s) => (
                <option key={s} value={s} style={{ backgroundColor: '#0F172A', color: '#F8FAFC' }}>
                  {s === 'All' ? 'All Statuses' : s.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Polls Listing */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : polls.length === 0 ? (
        <EmptyState
          title="No polls match your criteria"
          description="Try adjusting your search query, status, or category filter."
          actionLabel="Clear Filters"
          onAction={() => { setSearch(''); setCategory('All'); setStatus('All'); setPage(1); }}
        />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem', marginBottom: '3rem' }}>
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>
                Page <strong style={{ color: '#F8FAFC' }}>{page}</strong> of {totalPages}
              </span>

              <button
                type="button"
                className="btn btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
