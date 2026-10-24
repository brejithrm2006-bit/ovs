export function formatDateTime(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
}

export function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return isoString;
  }
}

export function getTimeRemaining(endIsoString) {
  if (!endIsoString) return { status: 'unknown', text: 'No end date' };
  const now = new Date().getTime();
  const target = new Date(endIsoString).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { status: 'ended', text: 'Poll Closed', isEnded: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 1) {
    return { status: 'open', text: `${days} days left`, isEnded: false };
  } else if (days === 1) {
    return { status: 'open', text: `1 day ${hours}h left`, isEnded: false };
  } else if (hours > 0) {
    return { status: 'ending_soon', text: `${hours}h ${minutes}m left`, isEnded: false };
  } else {
    return { status: 'ending_soon', text: `${minutes}m left`, isEnded: false };
  }
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString();
}
