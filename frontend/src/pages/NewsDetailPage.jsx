import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';
import { ArrowLeft, Calendar, Vote, Share2 } from 'lucide-react';

export default function NewsDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await api.public.getNewsBySlug(slug);
        setArticle(res.article);
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="container-custom" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #1E293B', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: '#94A3B8' }}>Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container-custom" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: '#F8FAFC', marginBottom: '1rem' }}>Article Not Found</h2>
        <Link to="/news" className="btn btn-secondary">
          Back to News
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom" style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '860px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/news" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', textDecoration: 'none', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Announcements
        </Link>
      </div>

      <article className="glass-panel" style={{ borderRadius: '1.25rem', overflow: 'hidden', padding: '2.5rem' }}>
        {article.cover_image && (
          <div style={{ width: '100%', height: '360px', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '2rem' }}>
            <img src={article.cover_image} alt={article.headline} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#38BDF8', fontSize: '0.88rem', fontWeight: 600, marginBottom: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={15} /> {formatDate(article.published_at)}
          </span>
          {article.related_poll_id && (
            <Link
              to={`/polls/${article.related_poll_id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38BDF8',
                padding: '0.2rem 0.6rem',
                borderRadius: '0.35rem',
                textDecoration: 'none',
                fontSize: '0.8rem',
              }}
            >
              <Vote size={13} /> View Linked Poll
            </Link>
          )}
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1.25, marginBottom: '1.5rem' }}>
          {article.headline}
        </h1>

        <div style={{ fontSize: '1.15rem', color: '#CBD5E1', lineHeight: 1.7, marginBottom: '2rem', borderBottom: '1px solid #1E293B', paddingBottom: '1.5rem', fontWeight: 500 }}>
          {article.summary}
        </div>

        <div style={{ color: '#E2E8F0', fontSize: '1rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
          {article.content}
        </div>
      </article>
    </div>
  );
}
