import React from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckCircle2, Clock, Calendar, ArrowRight } from 'lucide-react';
import { formatNumber, getTimeRemaining } from '../utils/formatters';

export default function PollCard({ poll }) {
  if (!poll) return null;

  const dynamicStatus = poll.status || 'draft';
  const remaining = getTimeRemaining(poll.end_date);
  const totalVotes = poll.total_votes || 0;
  const candidateCount = poll.candidate_count || (poll.candidates ? poll.candidates.length : 0);

  let statusBadgeClass = 'badge-upcoming';
  let statusText = 'Upcoming';

  if (dynamicStatus === 'active') {
    statusBadgeClass = 'badge-active';
    statusText = 'Active Now';
  } else if (dynamicStatus === 'closed') {
    statusBadgeClass = 'badge-closed';
    statusText = 'Closed';
  } else if (dynamicStatus === 'archived') {
    statusBadgeClass = 'badge-closed';
    statusText = 'Archived';
  }

  const defaultBanner = 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=80';

  return (
    <div
      className="glass-panel glass-panel-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '1rem',
        overflow: 'hidden',
        height: '100%',
        position: 'relative'
      }}
    >
      {/* Banner */}
      <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden', backgroundColor: '#1E293B' }}>
        <img
          src={poll.banner_image || defaultBanner}
          alt={poll.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onError={(e) => { e.target.src = defaultBanner; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.2) 60%, rgba(15, 23, 42, 0) 100%)' }} />

        {/* Badges Overlay */}
        <div style={{ position: 'absolute', top: '0.85rem', left: '0.85rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className={`badge ${statusBadgeClass}`}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
            {statusText}
          </span>
          <span className="badge badge-category">
            {poll.category}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#F8FAFC',
            marginBottom: '0.5rem',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {poll.title}
        </h3>

        <p
          style={{
            fontSize: '0.85rem',
            color: '#94A3B8',
            marginBottom: '1rem',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1
          }}
        >
          {poll.description}
        </p>

        {/* Stats Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '0.65rem',
            marginBottom: '1.25rem',
            fontSize: '0.8rem',
            color: '#CBD5E1'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Users size={15} color="#38BDF8" />
            <span><strong>{candidateCount}</strong> Candidates</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={15} color="#34D399" />
            <span><strong>{formatNumber(totalVotes)}</strong> Votes</span>
          </div>
        </div>

        {/* Footer Meta & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: remaining.status === 'ending_soon' ? '#FBBF24' : '#94A3B8' }}>
            <Clock size={14} />
            <span>{remaining.text}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              to={`/polls/${poll.id}`}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
            >
              View
            </Link>
            {dynamicStatus === 'active' && (
              <Link
                to={`/polls/${poll.id}`}
                className="btn btn-primary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              >
                Vote Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
