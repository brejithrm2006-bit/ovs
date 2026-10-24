import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { X, Award, FileText, CheckCircle2 } from 'lucide-react';

export default function ApplyPollModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [availablePolls, setAvailablePolls] = useState([]);
  const [loadingPolls, setLoadingPolls] = useState(true);

  const [pollId, setPollId] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [reason, setReason] = useState('');
  const [supportingInfo, setSupportingInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    async function loadPolls() {
      setLoadingPolls(true);
      try {
        const res = await api.public.getActive();
        setAvailablePolls(res.polls || []);
        if (res.polls && res.polls.length > 0) {
          setPollId(res.polls[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPolls(false);
      }
    }
    loadPolls();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!pollId || !introduction.trim() || !reason.trim()) {
      setErrorMsg('Please select a poll and provide both introduction and reason.');
      return;
    }

    setSubmitting(true);
    try {
      await api.applications.submit({
        poll_id: parseInt(pollId),
        introduction: introduction.trim(),
        reason: reason.trim(),
        supporting_info: supportingInfo.trim(),
      });
      addToast({
        type: 'success',
        title: 'Application Submitted',
        message: 'Your candidacy application is now pending administrator review.',
      });
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '560px',
          width: '100%',
          backgroundColor: '#0F172A',
          border: '1px solid #334155',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1E293B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Award size={22} color="#F59E0B" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC' }}>
              Apply to an Existing Poll
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
          {errorMsg && (
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', color: '#F87171', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {errorMsg}
            </div>
          )}

          {/* User Identity Confirmation */}
          <div style={{ padding: '0.85rem 1rem', backgroundColor: '#0B1120', borderRadius: '0.65rem', border: '1px solid #1E293B', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>
            <div>Applying as: <strong style={{ color: '#F8FAFC' }}>{user?.full_name}</strong> (@{user?.username})</div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>Verified Account Identity. Impersonation of other candidates is prevented by design.</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="poll_select">Target Ballot / Poll</label>
            {loadingPolls ? (
              <div className="skeleton" style={{ width: '100%', height: '40px' }} />
            ) : availablePolls.length === 0 ? (
              <div style={{ color: '#F87171', fontSize: '0.85rem' }}>No active polls currently accepting applications.</div>
            ) : (
              <select
                id="poll_select"
                className="form-select"
                value={pollId}
                onChange={(e) => setPollId(e.target.value)}
                required
              >
                {availablePolls.map((p) => (
                  <option key={p.id} value={p.id} style={{ backgroundColor: '#0F172A', color: '#F8FAFC' }}>
                    {p.title} ({p.category})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cand_intro">Candidate Vision / Introduction Statement</label>
            <textarea
              id="cand_intro"
              rows="3"
              className="form-textarea"
              placeholder="State your campaign platform or key policy stance..."
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cand_reason">Reason for Applying</label>
            <textarea
              id="cand_reason"
              rows="2"
              className="form-textarea"
              placeholder="Explain why you are seeking nomination in this specific election..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cand_support">Supporting Qualifications or Past Leadership (Optional)</label>
            <textarea
              id="cand_support"
              rows="2"
              className="form-textarea"
              placeholder="Relevant leadership experience, academic standing, or achievements..."
              value={supportingInfo}
              onChange={(e) => setSupportingInfo(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #1E293B', paddingTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || availablePolls.length === 0}>
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
