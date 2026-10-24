import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Vote, User, Phone, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: 'voter', // 'voter' or 'candidate'
    profile_image: '',
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.full_name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!formData.username.trim() || formData.username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage('Phone number is required.');
      return;
    }

    if (!formData.password) {
      setErrorMessage('Password is required.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!formData.terms) {
      setErrorMessage('You must accept the Community Voting Terms of Service.');
      return;
    }

    setLoading(true);
    try {
      const user = await register(formData);
      addToast({
        type: 'success',
        title: 'Registration Successful!',
        message: `Welcome to VotePulse, @${user.username}!`,
      });

      if (user.role === 'candidate') {
        navigate('/candidate');
      } else {
        navigate('/voter');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
      addToast({
        type: 'error',
        title: 'Registration Failed',
        message: err.message || 'Could not complete registration.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 4.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div
        className="glass-panel"
        style={{
          maxWidth: '540px',
          width: '100%',
          padding: '2.5rem',
          borderRadius: '1.25rem',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
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
            Create Voter Account
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Join the community ballot platform. Zero email required.
          </p>
        </div>

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
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="full_name">
              Full Legal / Campus Name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              className="form-input"
              placeholder="e.g. Jordan Lee"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Username & Phone Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="form-input"
                  placeholder="e.g. jordan_lee"
                  value={formData.username}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.3rem' }}
                  required
                />
                <User
                  size={16}
                  color="#64748B"
                  style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 5550107777"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.3rem' }}
                  required
                />
                <Phone
                  size={16}
                  color="#64748B"
                  style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>
          </div>

          {/* Account Role Intent */}
          <div className="form-group">
            <label className="form-label">Primary Account Goal</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: formData.role === 'voter' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  border: `1px solid ${formData.role === 'voter' ? '#38BDF8' : '#334155'}`,
                  borderRadius: '0.65rem',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  color: '#F8FAFC',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="voter"
                  checked={formData.role === 'voter'}
                  onChange={handleChange}
                  style={{ accentColor: '#2563EB' }}
                />
                Voter
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: formData.role === 'candidate' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  border: `1px solid ${formData.role === 'candidate' ? '#FBBF24' : '#334155'}`,
                  borderRadius: '0.65rem',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  color: '#F8FAFC',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="candidate"
                  checked={formData.role === 'candidate'}
                  onChange={handleChange}
                  style={{ accentColor: '#F59E0B' }}
                />
                Prospective Candidate
              </label>
            </div>
          </div>

          {/* Passwords */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.3rem', paddingRight: '2.3rem' }}
                  required
                />
                <Lock
                  size={16}
                  color="#64748B"
                  style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.65rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                  }}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm_password">
                Confirm Password
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Repeat password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Optional Profile Avatar URL */}
          <div className="form-group">
            <label className="form-label" htmlFor="profile_image">
              Profile Avatar Image URL (Optional)
            </label>
            <input
              id="profile_image"
              name="profile_image"
              type="url"
              className="form-input"
              placeholder="https://example.com/photo.jpg"
              value={formData.profile_image}
              onChange={handleChange}
            />
          </div>

          {/* Terms Acceptance */}
          <div style={{ margin: '1.25rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: '#CBD5E1', fontSize: '0.85rem', cursor: 'pointer', lineHeight: 1.4 }}>
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                style={{ accentColor: '#2563EB', marginTop: '0.2rem' }}
                required
              />
              <span>
                I agree to the Community Charter and confirm that I hold only one voting account.
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.98rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: '#94A3B8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#38BDF8', fontWeight: 600, textDecoration: 'none' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
