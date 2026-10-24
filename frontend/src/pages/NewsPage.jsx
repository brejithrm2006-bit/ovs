import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/formatters';
import { Newspaper, ChevronRight, ChevronLeft } from 'lucide-react';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await api.public.getNews(page);
      setNews(res.news || []);
      setTotalPages(res.pages || 1);
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [page]);

  return (
    <div className="container-custom" style={{ padding: '3.5rem 1.5rem 5rem' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
        <div style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
          Official Press & Bulletins
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.75rem' }}>
          Platform Announcements
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '1rem' }}>
          Stay updated with official statements, candidate town halls, and voting timelines.
        </p>
      </div>

      {loading ? (
        <CardSkeleton count={6} />
      ) : news.length === 0 ? (
        <EmptyState title="No published bulletins" description="There are currently no published news articles." />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            {news.map((item) => (
              <div
                key={item.id}
                className="glass-panel glass-panel-hover"
                style={{ borderRadius: '1.25rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ width: '100%', height: '200px', backgroundColor: '#1E293B', overflow: 'hidden' }}>
                  <img
                    src={item.cover_image || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80'}
                    alt={item.headline}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {formatDate(item.published_at)}
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.75rem', lineHeight: 1.35 }}>
                    {item.headline}
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                    {item.summary}
                  </p>
                  <Link
                    to={`/news/${item.slug}`}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: 'auto' }}
                  >
                    Read Article <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

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
