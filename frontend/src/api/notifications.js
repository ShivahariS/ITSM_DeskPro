import api from './client.js';

export const listNotifications = () => api.get('/notifications').then((r) => r.data);
export const getUnreadCount = () =>
  api.get('/notifications/unread-count').then((r) => r.data?.unreadCount ?? 0);
export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`).then((r) => r.data);
export const dismissNotification = (id) =>
  api.patch(`/notifications/${id}/dismiss`).then((r) => r.data);
