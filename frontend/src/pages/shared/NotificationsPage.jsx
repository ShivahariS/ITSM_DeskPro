import { useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, Check, X, BellOff } from 'lucide-react';
import { PageHeader, Card, Loading, ErrorState, EmptyState, Button, Badge } from '../../components/ui/index.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { fromNow } from '../../lib/format.js';
import { humanize, NOTIFICATION_STATUS_BADGE } from '../../lib/constants.js';
import {
  listNotifications, markNotificationRead, dismissNotification,
} from '../../api/notifications.js';
import { changePassword } from '../../api/users.js';

export default function NotificationsPage() {
  const { data, loading, error, reload } = useAsync(listNotifications);
  const items = (data || []).filter((n) => n.status !== 'DISMISSED');
  const unread = items.filter((n) => n.status === 'UNREAD').length;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      toast.success('Marked as read');
      reload();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed to mark as read.');
    }
  };

  const handleDismiss = async (id) => {
    try {
      await dismissNotification(id);
      toast.success('Dismissed');
      reload();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed to dismiss.');
    }
  };

  const handleMarkAllRead = async () => {
    const unreadItems = items.filter((n) => n.status === 'UNREAD');
    if (unreadItems.length === 0) return;
    try {
      await Promise.all(unreadItems.map((n) => markNotificationRead(n.notificationID)));
      toast.success('All notifications marked as read');
      reload();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed to mark all as read.');
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    setSubmitting(true);
    try {
      await changePassword(oldPassword, newPassword);
      await dismissNotification(selectedNotificationId);
      toast.success('Password updated successfully!');
      setIsModalOpen(false);
      reload();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Personal alerts and activity updates"
        actions={
          <>
            {unread > 0 && (
              <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
                <Check size={14} /> Mark all as read
              </Button>
            )}
            <Badge className="bg-cyanaccent-100 text-cyanaccent-800">
              <Bell size={14} /> {unread} unread
            </Badge>
          </>
        }
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState icon={BellOff} title="You're all caught up" message="No notifications right now." />
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const isUnread = n.status === 'UNREAD';
            const isPasswordResetApproval = n.message && n.message.toLowerCase() === 'you request to change password has been approved';
            return (
              <Card
                key={n.notificationID}
                className={`flex items-start gap-4 p-4 ${isUnread ? 'border-l-4 border-l-cyanaccent-400 bg-mint/40' : ''}`}
              >
                <span className="mt-0.5 rounded-lg bg-mint p-2 text-plum">
                  <Bell size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slateblue-100 px-2 py-0.5 text-[11px] font-semibold text-slateblue-700">
                      {humanize(n.category)}
                    </span>
                    <StatusBadge value={n.status} map={NOTIFICATION_STATUS_BADGE} />
                    <span className="text-xs text-slateblue-400">{fromNow(n.createdDate)}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-gray-700">{n.message}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {isPasswordResetApproval ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedNotificationId(n.notificationID);
                        setOldPassword('');
                        setNewPassword('');
                        setIsModalOpen(true);
                      }}
                      className="bg-cyanaccent-400 hover:bg-cyanaccent-500 text-white font-medium shadow-sm"
                    >
                      Change Password
                    </Button>
                  ) : (
                    <>
                      {isUnread && (
                        <Button variant="ghost" size="sm" onClick={() => handleRead(n.notificationID)}>
                          <Check size={14} /> Read
                        </Button>
                      )}
                      {n.status !== 'DISMISSED' && (
                        <Button variant="ghost" size="sm" onClick={() => handleDismiss(n.notificationID)}>
                          <X size={14} /> Dismiss
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md scale-95 transform rounded-2xl bg-white p-6 shadow-2xl transition-all border border-gray-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-mint/50 text-plum">
                <Bell size={18} />
              </span>
              Change Your Password
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              Provide your current password and set a new password to fulfill this request.
            </p>

            <form onSubmit={handlePasswordChangeSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700">Old Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:border-cyanaccent-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyanaccent-400 transition-all"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:border-cyanaccent-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyanaccent-400 transition-all"
                  placeholder="Enter new password"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="bg-cyanaccent-400 hover:bg-cyanaccent-500 text-white"
                >
                  {submitting ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
