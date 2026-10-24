import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PollCard from '../components/PollCard';
import { CardSkeleton, StatsSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { formatNumber, formatDate, formatDateTime } from '../utils/formatters';
import {
  Vote,
  Users,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Shield,
  Award,
  Clock,
  Radio,
  FileText,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  Activity,
  Calendar,
  Layers
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

export default function HomePage() {
  const { isAuthenticated, isCandidate, isAdmin } = useAuth();

  // State management
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [mostActivePolls, setMostActivePolls] = useState([]);
  const [activeLoading, setActiveLoading] = useState(true);

  const [trendingPolls, setTrendingPolls] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [trendingLoading, setTrendingLoading] = useState(true);

  const [liveResultsPoll, setLiveResultsPoll] = useState(null);
  const [liveResults, setLiveResults] = useState(null);
  const [liveResultsLoading, setLiveResultsLoading] = useState(true);

  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const [activities, setActivities] = useState([]);

  const categories = [
    'All',
    'Technology',
    'Student Activities',
    'Innovation',
    'Sports',
    'Community',
    'Entertainment',
  ];

  // Colors for charts
  const CHART_COLORS = ['#38BDF8', '#818CF8', '#34D399', '#FBBF24', '#F472B6', '#A78BFA'];

  // Load Platform Stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.public.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Load Most Active Polls
  useEffect(() => {
    async function fetchActive() {
      try {
        const data = await api.public.getTrending();
        setMostActivePolls(data.polls || []);
        // Pick first active poll for live preview if available
        if (data.polls && data.polls.length > 0) {
          const previewTarget = data.polls.find(p => p.status === 'active') || data.polls[0];
          setLiveResultsPoll(previewTarget);
        }
      } catch (err) {
        console.error('Failed to fetch most active polls:', err);
      } finally {
        setActiveLoading(false);
      }
    }
    fetchActive();
  }, []);

  // Load Trending Polls by Category
  useEffect(() => {
    async function fetchTrending() {
      setTrendingLoading(true);
      try {
        const data = await api.public.getTrending(selectedCategory === 'All' ? null : selectedCategory);
        setTrendingPolls(data.polls || []);
      } catch (err) {
        console.error('Failed to fetch trending polls:', err);
      } finally {
        setTrendingLoading(false);
      }
    }
    fetchTrending();
  }, [selectedCategory]);

  // Load Live Results for preview poll
  useEffect(() => {
    if (!liveResultsPoll) return;
    async function fetchResults() {
      setLiveResultsLoading(true);
      try {
        const res = await api.polls.getResults(liveResultsPoll.id);
        setLiveResults(res);
      } catch (err) {
        setLiveResults(null);
      } finally {
        setLiveResultsLoading(false);
      }
    }
    fetchResults();
  }, [liveResultsPoll]);

  // Load News & Public Activity
  useEffect(() => {
    async function fetchNewsAndActivity() {
      try {
        const newsData = await api.public.getNews(1);
        setNews(newsData.news ? newsData.news.slice(0, 3) : []);

        const actData = await api.public.getActivity();
        setActivities(actData.activities || []);
      } catch (err) {
        console.error('Failed to fetch news or activity:', err);
      } finally {
        setNewsLoading(false);
      }
    }
    fetchNewsAndActivity();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5.5rem', paddingBottom: '4rem' }}>
      {/* ====================================================================
          SECTION B: HERO SECTION
          ==================================================================== */}
      <section className="bg-radial-gradient" style={{ position: 'relative', overflow: 'hidden', paddingTop: '4rem', paddingBottom: '3rem' }}>
        <div className="container-custom" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
            {/* Left Content */}
            <div>
              {/* Live Indicator Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.35rem 0.85rem',
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#38BDF8',
                  marginBottom: '1.5rem',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block', boxShadow: '0 0 10px #10B981' }} />
                <span>Live Decentralized Balloting Active</span>
              </div>

              <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', color: '#F8FAFC' }}>
                Every Vote Creates <br />
                <span className="text-gradient-electric">a Difference.</span>
              </h1>

              <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: 1.6, maxWidth: '540px', marginBottom: '2rem' }}>
                Discover the polls shaping conversations, explore vetted candidates, and make your voice count with tamper-proof single-ballot verification.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                <Link to="/polls" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                  Explore Polls <ArrowRight size={18} />
                </Link>
                <Link to="/candidate" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                  Become a Candidate
                </Link>
              </div>

              {/* Floating Trust Metrics */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#CBD5E1', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Shield size={16} color="#10B981" /> No Email Tracking
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} color="#38BDF8" /> One Ballot Per Voter
                </div>
              </div>
            </div>

            {/* Right Graphic: Interactive CSS Illustration */}
            <div style={{ position: 'relative' }}>
              <div
                className="glass-panel pulse-glow"
                style={{
                  padding: '2rem',
                  borderRadius: '1.5rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  boxShadow: '0 25px 60px -15px rgba(37, 99, 235, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #1E293B', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    <span style={{ fontSize: '0.8rem', color: '#94A3B8', marginLeft: '0.5rem', fontWeight: 600 }}>
                      VotePulse Live Terminal
                    </span>
                  </div>
                  <span className="badge badge-active">Secure Verified</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: '#0B1120', borderRadius: '0.75rem', border: '1px solid #1E293B' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600, color: '#F8FAFC' }}>Green Energy & Solar Microgrid</span>
                      <span style={{ color: '#38BDF8', fontWeight: 700 }}>58.4%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#1E293B', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: '58.4%', height: '100%', backgroundColor: '#38BDF8', borderRadius: '9999px' }} />
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: '#0B1120', borderRadius: '0.75rem', border: '1px solid #1E293B' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600, color: '#F8FAFC' }}>Next-Gen AI Research Center</span>
                      <span style={{ color: '#818CF8', fontWeight: 700 }}>29.1%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#1E293B', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: '29.1%', height: '100%', backgroundColor: '#818CF8', borderRadius: '9999px' }} />
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: '#0B1120', borderRadius: '0.75rem', border: '1px solid #1E293B' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600, color: '#F8FAFC' }}>Athletics & Gym Modernization</span>
                      <span style={{ color: '#34D399', fontWeight: 700 }}>12.5%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#1E293B', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: '12.5%', height: '100%', backgroundColor: '#34D399', borderRadius: '9999px' }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B' }}>
                  <span>State: Active • Atomic Transactions</span>
                  <span>Database: Synchronized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION C: PLATFORM STATISTICS (Backend API Verified)
          ==================================================================== */}
      <section className="container-custom">
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
            Live Platform Metrics
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Real-time numbers synchronized directly with the transactional database.
          </p>
        </div>

        {statsLoading ? (
          <StatsSkeleton />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '1rem', borderLeft: '4px solid #38BDF8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>Total Registered Voters</span>
                <Users size={20} color="#38BDF8" />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>
                {formatNumber(stats?.total_voters)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.5rem' }}>
                Verified phone accounts
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '1rem', borderLeft: '4px solid #10B981' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>Active Polls</span>
                <Radio size={20} color="#10B981" />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>
                {formatNumber(stats?.active_polls)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.5rem' }}>
                Currently accepting ballots
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '1rem', borderLeft: '4px solid #818CF8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>Registered Candidates</span>
                <Award size={20} color="#818CF8" />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>
                {formatNumber(stats?.registered_candidates)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.5rem' }}>
                Official approved leaders
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '1rem', borderLeft: '4px solid #FBBF24' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>Total Votes Cast</span>
                <CheckCircle2 size={20} color="#FBBF24" />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>
                {formatNumber(stats?.total_votes_cast)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.5rem' }}>
                Audited valid submissions
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ====================================================================
          SECTION D: MOST ACTIVE POLLS
          ==================================================================== */}
      <section className="container-custom">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38BDF8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
              <TrendingUp size={16} /> High Engagement
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC' }}>
              Most Active Polls
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
              Polls commanding the highest participation and recent community voting volume.
            </p>
          </div>

          <Link to="/polls" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            View All Polls <ArrowRight size={16} />
          </Link>
        </div>

        {activeLoading ? (
          <CardSkeleton count={3} />
        ) : mostActivePolls.length === 0 ? (
          <EmptyState title="No active polls available" description="There are currently no active polls. Check back soon!" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {mostActivePolls.slice(0, 3).map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}
      </section>

      {/* ====================================================================
          SECTION E: TRENDING POLLS & CATEGORY FILTER
          ==================================================================== */}
      <section className="container-custom" id="trending">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.5rem' }}>
            Trending Topics & Ballots
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
            Filter by domain interest to review candidate platforms and debate agendas.
          </p>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  backgroundColor: selectedCategory === cat ? '#2563EB' : 'rgba(30, 41, 59, 0.6)',
                  borderColor: selectedCategory === cat ? '#38BDF8' : '#334155',
                  color: selectedCategory === cat ? '#FFFFFF' : '#94A3B8',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {trendingLoading ? (
          <CardSkeleton count={3} />
        ) : trendingPolls.length === 0 ? (
          <EmptyState
            title={`No polls found in ${selectedCategory}`}
            description="Be the first to propose a new poll in this category!"
            actionLabel="Propose a Poll"
            onAction={() => window.location.href = '/candidate'}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {trendingPolls.slice(0, 6).map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}
      </section>

      {/* ====================================================================
          SECTION F: LIVE RESULTS PREVIEW (Recharts Integrated)
          ==================================================================== */}
      <section className="container-custom">
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '1.25rem', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                <Activity size={16} /> Dynamic Tabulation
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#F8FAFC' }}>
                Live Ballot Results Preview
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
                Calculated directly from confirmed database vote receipts.
              </p>
            </div>

            {liveResults && (
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748B' }}>
                <div>Status: <span style={{ color: '#38BDF8', fontWeight: 600 }}>{liveResults.status?.toUpperCase()}</span></div>
                <div>Last updated: {formatDateTime(liveResults.last_updated)}</div>
              </div>
            )}
          </div>

          {liveResultsLoading ? (
            <div className="skeleton" style={{ width: '100%', height: '320px' }} />
          ) : !liveResults || !liveResults.candidate_results || liveResults.candidate_results.length === 0 ? (
            <EmptyState title="Results are not yet available for preview" description="Ballots are currently being recorded or held under hidden visibility rules until closure." />
          ) : (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38BDF8', marginBottom: '1.5rem' }}>
                {liveResults.title} ({formatNumber(liveResults.total_valid_votes)} Total Votes)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                {/* Bar Chart View */}
                <div style={{ height: '300px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={liveResults.candidate_results}
                      margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                    >
                      <XAxis
                        dataKey="full_name"
                        stroke="#64748B"
                        fontSize={12}
                        tickLine={false}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.5rem', color: '#F8FAFC' }}
                        formatter={(val) => [`${val} votes`, 'Votes']}
                      />
                      <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                        {liveResults.candidate_results.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Candidate Vote Breakdown List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {liveResults.candidate_results.map((c, i) => (
                    <div key={c.candidate_id} style={{ padding: '0.85rem 1rem', backgroundColor: '#0B1120', borderRadius: '0.65rem', border: '1px solid #1E293B' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#F8FAFC' }}>{c.full_name}</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38BDF8' }}>
                          {c.percentage}% <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>({c.votes} votes)</span>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#1E293B', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${c.percentage}%`, height: '100%', backgroundColor: CHART_COLORS[i % CHART_COLORS.length], borderRadius: '9999px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          SECTION G: LATEST POLL NEWS
          ==================================================================== */}
      <section className="container-custom">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
              Official Bulletins
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC' }}>
              Latest Poll News & Updates
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
              Editorial statements, candidate debates, and election notices published by administrators.
            </p>
          </div>

          <Link to="/news" className="btn btn-secondary">
            View All News <ArrowRight size={16} />
          </Link>
        </div>

        {newsLoading ? (
          <CardSkeleton count={3} />
        ) : news.length === 0 ? (
          <EmptyState title="No news articles published yet" description="Official announcements will appear here once published." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {news.map((item) => (
              <div
                key={item.id}
                className="glass-panel glass-panel-hover"
                style={{ borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ width: '100%', height: '170px', backgroundColor: '#1E293B', overflow: 'hidden' }}>
                  <img
                    src={item.cover_image || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80'}
                    alt={item.headline}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', color: '#38BDF8', marginBottom: '0.4rem', fontWeight: 600 }}>
                    {formatDate(item.published_at)}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.65rem', lineHeight: 1.35 }}>
                    {item.headline}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '1.25rem', flex: 1 }}>
                    {item.summary}
                  </p>
                  <Link
                    to={`/news/${item.slug}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: '#38BDF8',
                      textDecoration: 'none',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      marginTop: 'auto',
                    }}
                  >
                    Read Full Article <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ====================================================================
          SECTION H: HOW IT WORKS (3 Roles Breakdown)
          ==================================================================== */}
      <section className="container-custom" id="how-it-works">
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem' }}>
          <div style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
            Decentralized Governance
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.75rem' }}>
            How VotePulse Operates
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1rem', lineHeight: 1.6 }}>
            A transparent triad architecture ensuring fairness, verifiable candidacies, and strict ballot separation.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Card 1: Voters */}
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem', borderTop: '4px solid #38BDF8' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8', marginBottom: '1.25rem' }}>
              <Vote size={24} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.75rem' }}>
              1. For Voters
            </h3>
            <ol style={{ paddingLeft: '1.25rem', color: '#CBD5E1', fontSize: '0.9rem', lineHeight: 1.8 }}>
              <li>Register with a verified phone number and unique username.</li>
              <li>Explore open ballots by category and candidate profiles.</li>
              <li>Review candidate statements and select your candidate.</li>
              <li>Submit atomic ballot with duplicate submission prevention.</li>
              <li>Monitor real-time tallies as soon as visibility opens.</li>
            </ol>
          </div>

          {/* Card 2: Candidates */}
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem', borderTop: '4px solid #F59E0B' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', marginBottom: '1.25rem' }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.75rem' }}>
              2. For Candidates
            </h3>
            <ol style={{ paddingLeft: '1.25rem', color: '#CBD5E1', fontSize: '0.9rem', lineHeight: 1.8 }}>
              <li>Sign in using your verified credentials.</li>
              <li>Apply to an upcoming poll or request a custom ballot.</li>
              <li>Submit your public bio, credentials, and vision statement.</li>
              <li>Track administrative review and status in real-time.</li>
              <li>Manage your approved campaign platform on live ballots.</li>
            </ol>
          </div>

          {/* Card 3: Administrators */}
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem', borderTop: '4px solid #EF4444' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', marginBottom: '1.25rem' }}>
              <Shield size={24} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.75rem' }}>
              3. For Administrators
            </h3>
            <ol style={{ paddingLeft: '1.25rem', color: '#CBD5E1', fontSize: '0.9rem', lineHeight: 1.8 }}>
              <li>Stage official polls and configure visibility modes.</li>
              <li>Review candidate applications and approve nominations.</li>
              <li>Review community poll requests and generate draft elections.</li>
              <li>Publish news, official statements, and track contact messages.</li>
              <li>Monitor audit logs and export analytical integrity reports.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION I: CANDIDATE APPLICATION PROMOTION
          ==================================================================== */}
      <section className="container-custom">
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '1.5rem',
            padding: '3.5rem 2.5rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              <Sparkles size={16} /> Steer The Agenda
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '1rem', lineHeight: 1.2 }}>
              Have a Voice Worth Supporting?
            </h2>
            <p style={{ color: '#CBD5E1', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.25rem' }}>
              Registered users can step forward to run as verified candidates or propose new ballot topics for community participation.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/candidate" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '0.98rem' }}>
                Apply to Existing Poll
              </Link>
              <Link to="/candidate" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '0.98rem' }}>
                Request a New Poll
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION J: RECENT PUBLIC ACTIVITY (Privacy-Preserving)
          ==================================================================== */}
      <section className="container-custom">
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.35rem' }}>
            Recent Platform Activity
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Live cryptographic feed of open polls, approved candidates, and published bulletins.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {activities.length === 0 ? (
            <div className="glass-panel" style={{ padding: '1.5rem', color: '#94A3B8', textAlign: 'center', gridColumn: '1 / -1' }}>
              No recent updates recorded.
            </div>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8', flexShrink: 0 }}>
                  <Activity size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {act.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#64748B' }}>
                    <span>{formatDate(act.timestamp)}</span>
                    <span>•</span>
                    <span style={{ color: '#38BDF8' }}>{act.category}</span>
                  </div>
                </div>
                {act.link && (
                  <Link to={act.link} style={{ color: '#94A3B8', marginTop: '0.25rem' }}>
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* ====================================================================
          SECTION K: ABOUT VOTEPULSE
          ==================================================================== */}
      <section className="container-custom" id="about">
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '1.25rem', backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div style={{ maxWidth: '820px' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '1rem' }}>
              About the VotePulse Platform
            </h2>
            <p style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              VotePulse was architected as a complete, full-stack demonstration system highlighting modern engineering paradigms:
              declarative React user interfaces, Python Flask RESTful backends, PostgreSQL relational schema integrity, containerization with Docker & Docker Compose, and Kubernetes workload orchestration.
            </p>
            <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: 1.6 }}>
              <strong>Educational Project Scope:</strong> This deployment implements username and phone-based authentication, database transactions for one-vote enforcement, role-based authorization, and administrative auditing. It is designed specifically for academic, student, and community ballots and does not assert official government election certification.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
