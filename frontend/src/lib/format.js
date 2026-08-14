import { format, formatDistanceToNowStrict, isValid, parseISO, differenceInMinutes } from 'date-fns';

const toDate = (value) => {
  if (!value) return null;
  const d = typeof value === 'string' ? parseISO(value) : new Date(value);
  return isValid(d) ? d : null;
};

export const formatDate = (value) => {
  const d = toDate(value);
  return d ? format(d, 'dd MMM yyyy') : '—';
};

export const formatDateTime = (value) => {
  const d = toDate(value);
  return d ? format(d, 'dd MMM yyyy, HH:mm') : '—';
};

export const fromNow = (value) => {
  const d = toDate(value);
  return d ? `${formatDistanceToNowStrict(d)} ago` : '—';
};

// SLA countdown -> { text, tone } where tone drives colour (breached/at-risk/ok).
export const slaCountdown = (dueDate) => {
  const d = toDate(dueDate);
  if (!d) return { text: 'No SLA', tone: 'none' };
  const mins = differenceInMinutes(d, new Date());
  if (mins <= 0) return { text: `Breached ${formatDistanceToNowStrict(d)} ago`, tone: 'breached' };
  const label = formatDistanceToNowStrict(d);
  if (mins <= 120) return { text: `${label} left`, tone: 'risk' };
  return { text: `${label} left`, tone: 'ok' };
};

export const SLA_TONE_CLASS = {
  breached: 'text-red-600 font-semibold',
  risk: 'text-amber-600 font-semibold',
  ok: 'text-emerald-600',
  none: 'text-gray-400',
};

// Format an integer count of hours as a readable SLA duration.
export const formatSlaHours = (hours) => {
  if (hours == null) return '—';
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'}`;
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  return rem === 0 ? `${days} day${days === 1 ? '' : 's'}` : `${days}d ${rem}h`;
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || '?';

export const pct = (used, total) => {
  if (!total) return 0;
  return Math.round((Number(used) / Number(total)) * 100);
};

export const truncate = (text = '', len = 60) => {
  const str = String(text ?? '');
  return str.length > len ? `${str.slice(0, len).trimEnd()}…` : str;
};
