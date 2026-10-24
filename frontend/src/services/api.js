const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('votepulse_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.status === 401 && token) {
      // Token expired or invalid
      console.warn('Session expired or unauthorized. Logging out.');
      localStorage.removeItem('votepulse_token');
      localStorage.removeItem('votepulse_user');
      window.dispatchEvent(new Event('votepulse_auth_expired'));
    }
    throw error;
  }
}

export const api = {
  // Auth
  auth: {
    login: (identifier, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
    register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
    getMe: () => request('/auth/me'),
    updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },

  // Public
  public: {
    getStats: () => request('/public/stats'),
    getTrending: (category) => request(`/public/polls/trending?${category ? `category=${encodeURIComponent(category)}` : ''}`),
    getActive: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/public/polls/active?${q}`);
    },
    getNews: (page = 1) => request(`/public/news?page=${page}`),
    getNewsBySlug: (slug) => request(`/public/news/${slug}`),
    getActivity: () => request('/public/activity'),
  },

  // Polls
  polls: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/polls?${q}`);
    },
    get: (id) => request(`/polls/${id}`),
    vote: (pollId, candidateId) => request(`/polls/${pollId}/vote`, { method: 'POST', body: JSON.stringify({ candidate_id: candidateId }) }),
    getResults: (pollId) => request(`/polls/${pollId}/results`),
    getVoterHistory: () => request('/polls/voter/history'),
  },

  // Candidates
  candidates: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/candidates?${q}`);
    },
    get: (id) => request(`/candidates/${id}`),
  },

  // Applications
  applications: {
    submit: (payload) => request('/candidate/applications', { method: 'POST', body: JSON.stringify(payload) }),
    getMy: () => request('/candidate/applications'),
    adminList: (status) => request(`/admin/applications${status ? `?status=${status}` : ''}`),
    adminApprove: (id, notes) => request(`/admin/applications/${id}/approve`, { method: 'POST', body: JSON.stringify({ admin_notes: notes }) }),
    adminReject: (id, notes) => request(`/admin/applications/${id}/reject`, { method: 'POST', body: JSON.stringify({ admin_notes: notes }) }),
    adminRequestInfo: (id, notes) => request(`/admin/applications/${id}/request-info`, { method: 'POST', body: JSON.stringify({ admin_notes: notes }) }),
  },

  // Poll Requests
  pollRequests: {
    submit: (payload) => request('/candidate/poll-requests', { method: 'POST', body: JSON.stringify(payload) }),
    getMy: () => request('/candidate/poll-requests'),
    adminList: (status) => request(`/admin/poll-requests${status ? `?status=${status}` : ''}`),
    adminApprove: (id, notes) => request(`/admin/poll-requests/${id}/approve`, { method: 'POST', body: JSON.stringify({ admin_notes: notes }) }),
    adminReject: (id, notes) => request(`/admin/poll-requests/${id}/reject`, { method: 'POST', body: JSON.stringify({ admin_notes: notes }) }),
    adminRequestInfo: (id, notes) => request(`/admin/poll-requests/${id}/request-info`, { method: 'POST', body: JSON.stringify({ admin_notes: notes }) }),
  },

  // News
  news: {
    adminList: () => request('/admin/news'),
    adminCreate: (payload) => request('/admin/news', { method: 'POST', body: JSON.stringify(payload) }),
    adminUpdate: (id, payload) => request(`/admin/news/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    adminDelete: (id) => request(`/admin/news/${id}`, { method: 'DELETE' }),
  },

  // Notifications
  notifications: {
    getAll: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
  },

  // Contact
  contact: {
    submit: (payload) => request('/contact', { method: 'POST', body: JSON.stringify(payload) }),
    adminList: (isRead) => request(`/contact/admin/contact-messages${isRead !== undefined ? `?is_read=${isRead}` : ''}`),
    adminMarkRead: (id) => request(`/contact/admin/contact-messages/${id}/read`, { method: 'POST' }),
    adminSaveNotes: (id, notes) => request(`/contact/admin/contact-messages/${id}/notes`, { method: 'POST', body: JSON.stringify({ admin_notes: notes }) }),
  },

  // Admin
  admin: {
    getOverview: () => request('/admin/overview'),
    createPoll: (payload) => request('/admin/polls', { method: 'POST', body: JSON.stringify(payload) }),
    updatePoll: (id, payload) => request(`/admin/polls/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    publishPoll: (id) => request(`/admin/polls/${id}/publish`, { method: 'POST' }),
    closePoll: (id) => request(`/admin/polls/${id}/close`, { method: 'POST' }),
    archivePoll: (id) => request(`/admin/polls/${id}/archive`, { method: 'POST' }),
    addCandidateToPoll: (pollId, candidateId, statement) => request(`/admin/polls/${pollId}/candidates`, { method: 'POST', body: JSON.stringify({ candidate_id: candidateId, statement }) }),
    removeCandidateFromPoll: (pollId, candidateId) => request(`/admin/polls/${pollId}/candidates/${candidateId}`, { method: 'DELETE' }),
    createCandidate: (payload) => request('/admin/candidates', { method: 'POST', body: JSON.stringify(payload) }),
    updateCandidate: (id, payload) => request(`/admin/candidates/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    getVoters: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/admin/voters?${q}`);
    },
    toggleVoterStatus: (userId) => request(`/admin/voters/${userId}/toggle-status`, { method: 'POST' }),
    getAuditLogs: () => request('/admin/audit-logs'),
    getReportsOverview: () => request('/admin/reports/overview'),
  }
};
