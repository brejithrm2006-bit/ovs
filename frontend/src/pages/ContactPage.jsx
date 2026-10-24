import React, { useState } from 'react';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { Phone, User, MessageSquare, Send, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  const { addToast } = useNotifications();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.phone.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setErrorMessage('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      await api.contact.submit(formData);
      setSubmitted(true);
      addToast({
        type: 'success',
        title: 'Message Transmitted',
        message: 'Your inquiry has been stored securely for administrator review.',
      });
      setFormData({ name: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit contact message.');
      addToast({
        type: 'error',
        title: 'Submission Error',
        message: err.message || 'Could not send message.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom" style={{ padding: '3.5rem 1.5rem 5rem', maxWidth: '960px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
          Official Support Channel
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.75rem' }}>
          Direct Platform Contact
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Have inquiries regarding poll eligibility, candidate applications, or technical verification? Send a message directly to platform administrators.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
        {/* Left Information Panel */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.25rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1rem' }}>
            Zero-Email Privacy Policy
          </h3>
          <p style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            To safeguard voter privacy and eradicate spam, VotePulse does not store email addresses.
            All communications are indexed by verified usernames and phone numbers within the application.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid #1E293B', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8', flexShrink: 0 }}>
                <Phone size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.9rem' }}>Phone-Verified Inbox</div>
                <div style={{ color: '#94A3B8', fontSize: '0.82rem' }}>Administrator inquiries tracked via internal dashboard ticket IDs.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0 }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.9rem' }}>Encrypted Resolution</div>
                <div style={{ color: '#94A3B8', fontSize: '0.82rem' }}>All messages are restricted to authorized administrators.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Contact Form */}
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '1.25rem' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34D399', margin: '0 auto 1.25rem' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.5rem' }}>
                Message Received
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Thank you for reaching out. An election administrator has received your message in the admin console.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSubmitted(false)}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1.5rem' }}>
                Compose Message
              </h3>

              {errorMessage && (
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', color: '#F87171', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  {errorMessage}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Elena Rostova"
                    value={formData.name}
                    onChange={handleChange}
                    style={{ paddingLeft: '2.3rem' }}
                    required
                  />
                  <User size={16} color="#64748B" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 5550182233"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ paddingLeft: '2.3rem' }}
                    required
                  />
                  <Phone size={16} color="#64748B" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Question regarding nomination eligibility"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  className="form-textarea"
                  placeholder="Detail your inquiry or request..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.98rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                disabled={loading}
              >
                <Send size={18} /> {loading ? 'Transmitting...' : 'Submit Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
