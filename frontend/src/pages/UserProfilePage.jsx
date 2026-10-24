import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../services/api';
import { User, Phone, Lock, Save, Shield, CheckCircle2 } from 'lucide-react';

export default function UserProfilePage() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useNotifications();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.auth.updateProfile({
        full_name: fullName.trim(),
        profile_image: profileImage.trim(),
      });
      await refreshUser();
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your personal information was saved successfully.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update profile.',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      addToast({ type: 'warning', title: 'Input Required', message: 'Enter both current and new password.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', title: 'Mismatch', message: 'New passwords do not match.' });
      return;
    }

    setPwLoading(true);
    try {
      await api.auth.updateProfile({
        current_password: currentPassword,
        new_password: newPassword,
      });
      addToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your account password has been updated securely.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Password Change Failed',
        message: err.message || 'Could not update password.',
      });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="container-custom" style={{ padding: '3.5rem 1.5rem 5rem', maxWidth: '820px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.25rem' }}>
          User Account Profile
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
          Manage your verified voter identity and security credentials.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Profile Card */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #1E293B', paddingBottom: '1.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#1E293B',
                border: '2px solid #38BDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                fontWeight: 700,
                fontSize: '1.5rem',
                color: '#38BDF8',
              }}
            >
              {profileImage ? (
                <img src={profileImage} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                fullName ? fullName[0].toUpperCase() : 'U'
              )}
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC' }}>
                {user?.full_name}
              </h3>
              <div style={{ color: '#38BDF8', fontSize: '0.85rem' }}>
                @{user?.username} • <span style={{ textTransform: 'capitalize', color: '#CBD5E1' }}>{user?.role}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label" htmlFor="username_disabled">Verified Username</label>
              <input
                id="username_disabled"
                type="text"
                className="form-input"
                value={`@${user?.username}`}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone_disabled">Verified Phone</label>
              <input
                id="phone_disabled"
                type="text"
                className="form-input"
                value={user?.phone || 'Hidden for privacy'}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="full_name">Full Display Name</label>
              <input
                id="full_name"
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile_image">Profile Avatar Image URL</label>
              <input
                id="profile_image"
                type="url"
                className="form-input"
                placeholder="https://example.com/avatar.jpg"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              disabled={profileLoading}
            >
              <Save size={16} /> {profileLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Security / Password Card */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #1E293B', paddingBottom: '1rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8' }}>
              <Lock size={18} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC' }}>
              Security Credentials
            </h3>
          </div>

          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label" htmlFor="current_password">Current Password</label>
              <input
                id="current_password"
                type="password"
                className="form-input"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new_password">New Password</label>
              <input
                id="new_password"
                type="password"
                className="form-input"
                placeholder="Min 6 characters with letters and numbers"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm_password">Confirm New Password</label>
              <input
                id="confirm_password"
                type="password"
                className="form-input"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              disabled={pwLoading}
            >
              <Shield size={16} /> {pwLoading ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
