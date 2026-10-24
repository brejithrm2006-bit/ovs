import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Vote, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter both your Username/Phone and Password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(identifier.trim(), password);
      addToast({
        type: 'success',
        title: `Welcome back, ${user.full_name}!`,
        message: 'You have authenticated successfully.',
      });

      // Role-based routing redirect
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'candidate') {
        navigate('/candidate');
      } else {
        const from = location.state?.from?.pathname || '/voter';
        navigate(from);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
      addToast({
        type: 'error',
        title: 'Authentication Failed',
        message: err.message || 'Invalid username/phone or password.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 4.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div
        className="glass-panel"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '2.5rem',
          borderRadius: '1.25rem',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '3.2rem',
              height: '3.2rem',
              borderRadius: '0.85rem',
              background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.35)',
            }}
          >
            <Vote size={26} color="#FFFFFF" />
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.4rem' }}>
            Account Sign In
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Enter your registered username or phone number.
          </p>
        </div>

        {/* Demo Credentials Reminder Banner for Admin / Dev */}
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid #334155',
            borderRadius: '0.65rem',
            marginBottom: '1.5rem',
            fontSize: '0.8rem',
            color: '#CBD5E1',
          }}
        >
          <div style={{ fontWeight: 600, color: '#38BDF8', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} /> Quick Demo Access
          </div>
          <div>Admin: <code style={{ color: '#F8FAFC' }}>brmovs</code> / <code style={{ color: '#F8FAFC' }}>qw1988ab1988</code></div>
          <div>Voter: <code style={{ color: '#F8FAFC' }}>jordan_lee</code> / <code style={{ color: '#F8FAFC' }}>VoterPass123</code></div>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '0.65rem',
              marginBottom: '1.25rem',
              color: '#F87171',
              fontSize: '0.85rem',
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Identifier Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="identifier">
              Username or Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="identifier"
                type="text"
                className="form-input"
                placeholder="e.g. brmovs or 7025919468"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="username"
                required
              />
              <User
                size={18}
                color="#64748B"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                autoComplete="current-password"
                required
              />
              <Lock
                size={18}
                color="#64748B"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#2563EB', cursor: 'pointer' }}
              />
              Remember my session
            </label>

            <span style={{ color: '#64748B', fontSize: '0.78rem' }}>
              Phone-based Auth
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '0.98rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: '#94A3B8' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: '#38BDF8', fontWeight: 600, textDecoration: 'none' }}>
            Create one here
          </Link>
        </div>
      </div>
    </div>
  );
}
