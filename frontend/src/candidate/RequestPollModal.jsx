import React, { useState } from 'react';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { X, GitPullRequest, Plus, Trash2, AlertCircle } from 'lucide-react';

export default function RequestPollModal({ isOpen, onClose, onSuccess }) {
  const { addToast } = useNotifications();

  const [proposedTitle, setProposedTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [reason, setReason] = useState('');
  const [suggestedStartDate, setSuggestedStartDate] = useState('');
  const [suggestedEndDate, setSuggestedEndDate] = useState('');

  const [proposedCandidates, setProposedCandidates] = useState([
    { full_name: '', username: '', phone: '', introduction: '' }
  ]);

  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const categories = ['Technology', 'Student Activities', 'Innovation', 'Sports', 'Community', 'Entertainment', 'Other'];

  if (!isOpen) return null;

  const handleAddCandidate = () => {
    setProposedCandidates([
      ...proposedCandidates,
      { full_name: '', username: '', phone: '', introduction: '' }
    ]);
  };

  const handleRemoveCandidate = (index) => {
    if (proposedCandidates.length <= 1) return;
    setProposedCandidates(proposedCandidates.filter((_, i) => i !== index));
  };

  const handleCandidateChange = (index, field, value) => {
    const updated = [...proposedCandidates];
    updated[index][field] = value;
    setProposedCandidates(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!proposedTitle.trim() || !description.trim() || !reason.trim()) {
      setErrorMsg('Please provide a title, description, and justification reason.');
      return;
    }

    if (!consentConfirmed) {
      setErrorMsg('You must confirm that you have permission to provide proposed nominee details.');
      return;
    }

    // Filter valid proposed candidates
    const validCandidates = proposedCandidates.filter(c => c.full_name.trim().length > 0);

    setSubmitting(true);
    try {
      await api.pollRequests.submit({
        proposed_title: proposedTitle.trim(),
        description: description.trim(),
        category,
        reason: reason.trim(),
        suggested_start_date: suggestedStartDate ? new Date(suggestedStartDate).toISOString() : null,
        suggested_end_date: suggestedEndDate ? new Date(suggestedEndDate).toISOString() : null,
        proposed_candidates: validCandidates,
      });

      addToast({
        type: 'success',
        title: 'Poll Proposal Staged',
        message: 'Your new poll proposal was submitted for administrative review.',
      });
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit poll request.');
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
          maxWidth: '680px',
          width: '100%',
          backgroundColor: '#0F172A',
          border: '1px solid #334155',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1E293B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <GitPullRequest size={22} color="#38BDF8" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC' }}>
              Propose a New Community Ballot
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {errorMsg && (
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', color: '#F87171', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="req_title">Proposed Poll Title</label>
            <input
              id="req_title"
              type="text"
              className="form-input"
              placeholder="e.g. Student Wellness & Counseling Resource Expansion Ballot"
              value={proposedTitle}
              onChange={(e) => setProposedTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="req_cat">Category</label>
              <select
                id="req_cat"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c} style={{ backgroundColor: '#0F172A', color: '#F8FAFC' }}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="req_reason">Community Purpose / Justification</label>
              <input
                id="req_reason"
                type="text"
                className="form-input"
                placeholder="Why is this election needed now?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="req_desc">Detailed Poll Description & Rules</label>
            <textarea
              id="req_desc"
              rows="3"
              className="form-textarea"
              placeholder="Describe what voters will be deciding on and how the outcome will be implemented..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="req_start">Suggested Start Date</label>
              <input
                id="req_start"
                type="datetime-local"
                className="form-input"
                value={suggestedStartDate}
                onChange={(e) => setSuggestedStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="req_end">Suggested End Date</label>
              <input
                id="req_end"
                type="datetime-local"
                className="form-input"
                value={suggestedEndDate}
                onChange={(e) => setSuggestedEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Proposed Candidates Section */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #1E293B', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC' }}>
                  Proposed Candidate Nominees
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                  Provide names of recommended nominees. (Administrators verify each candidate prior to approval)
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddCandidate}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Plus size={14} /> Add Nominee
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {proposedCandidates.map((cand, idx) => (
                <div key={idx} style={{ padding: '1rem', backgroundColor: '#0B1120', borderRadius: '0.75rem', border: '1px solid #1E293B' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38BDF8' }}>
                      Nominee #{idx + 1}
                    </span>
                    {proposedCandidates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCandidate(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#F87171', cursor: 'pointer', padding: '0.2rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Full Name *"
                      value={cand.full_name}
                      onChange={(e) => handleCandidateChange(idx, 'full_name', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Username (if known)"
                      value={cand.username}
                      onChange={(e) => handleCandidateChange(idx, 'username', e.target.value)}
                    />
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Phone (optional private)"
                      value={cand.phone}
                      onChange={(e) => handleCandidateChange(idx, 'phone', e.target.value)}
                    />
                  </div>

                  <input
                    type="text"
                    className="form-input"
                    placeholder="Brief qualification or campaign slogan..."
                    value={cand.introduction}
                    onChange={(e) => handleCandidateChange(idx, 'introduction', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Consent Disclaimer Checkbox */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#CBD5E1', fontSize: '0.82rem', cursor: 'pointer', lineHeight: 1.5 }}>
              <input
                type="checkbox"
                checked={consentConfirmed}
                onChange={(e) => setConsentConfirmed(e.target.checked)}
                style={{ accentColor: '#2563EB', marginTop: '0.2rem' }}
                required
              />
              <span>
                <strong>Privacy & Nominee Consent Confirmation:</strong> I confirm that I have permission to submit these contact details for review. Submitting another person's information does not register them as an approved candidate, create an account, or establish their formal consent. Contact numbers are stored privately and never displayed publicly.
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #1E293B', paddingTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting Proposal...' : 'Submit Poll Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
