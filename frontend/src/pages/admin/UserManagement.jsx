import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Users, Trash2, ShieldCheck } from 'lucide-react';
import { PageHeader, Button, Select } from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { initials } from '../../lib/format.js';
import {
  ROLE_OPTIONS, ROLE_LABELS, USER_STATUSES, USER_STATUS_BADGE, TEAMS,
} from '../../lib/constants.js';
import {
  listUsers, updateUserRole, updateUserStatus, deleteUser,
} from '../../api/users.js';

const ROLE_SELECT = ROLE_OPTIONS.map((r) => ({ value: r, label: ROLE_LABELS[r] || r }));
const STATUS_SELECT = USER_STATUSES.map((s) => ({ value: s, label: s.charAt(0) + s.slice(1).toLowerCase() }));

export default function UserManagement() {
  const { data, loading, error, reload } = useAsync(listUsers);
  const [busyId, setBusyId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const users = useMemo(() => data || [], [data]);

  const handleRole = async (id, role) => {
    setBusyId(id);
    try {
      await updateUserRole(id, role);
      toast.success('Role updated');
      reload();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed to update role');
    } finally {
      setBusyId(null);
    }
  };

  const handleStatus = async (id, status) => {
    setBusyId(id);
    try {
      await updateUserStatus(id, status);
      toast.success('Status updated');
      reload();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteUser(toDelete.userID);
      toast.success('User deleted');
      setToDelete(null);
      reload();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'userID', header: 'User ID', render: (u) => <span className="font-semibold text-plum">#{u.userID}</span> },
    {
      key: 'name',
      header: 'Name',
      render: (u) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint text-xs font-bold text-plum">
            {initials(u.name)}
          </span>
          <span className="font-medium text-gray-700">{u.name}</span>
        </div>
      ),
    },
    { key: 'email', header: 'Email', render: (u) => <span className="text-slateblue-600">{u.email}</span> },
    { key: 'phone', header: 'Phone', render: (u) => u.phone || '—' },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <Select
          value={u.role}
          disabled={busyId === u.userID}
          onChange={(e) => handleRole(u.userID, e.target.value)}
          options={ROLE_SELECT}
          className="min-w-[9rem]"
        />
      ),
    },
    { key: 'team', header: 'Team', render: (u) => TEAMS[u.teamID] || '—' },
    { key: 'location', header: 'Location', render: (u) => u.locationID || '—' },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge value={u.status} map={USER_STATUS_BADGE} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <div className="flex items-center gap-2">
          <Select
            value={u.status}
            disabled={busyId === u.userID}
            onChange={(e) => handleStatus(u.userID, e.target.value)}
            options={STATUS_SELECT}
            className="min-w-[7.5rem]"
          />
          <Button variant="danger" size="sm" disabled={busyId === u.userID} onClick={() => setToDelete(u)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage roles, access status and accounts"
        actions={
          <span className="flex items-center gap-1.5 text-sm font-medium text-slateblue-600">
            <ShieldCheck size={16} className="text-cyanaccent-600" />
            {users.length} users
          </span>
        }
      />

      <DataTable
        columns={columns}
        rows={users}
        loading={loading}
        error={error}
        onRetry={reload}
        rowKey={(u) => u.userID}
        emptyIcon={Users}
        emptyTitle="No users found"
        emptyMessage="There are no registered users to manage."
      />

      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Delete user"
        subtitle={toDelete ? toDelete.name : ''}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              <Trash2 size={16} /> {deleting ? 'Deleting…' : 'Delete user'}
            </Button>
          </>
        }
      >
        {toDelete && (
          <p className="text-sm text-gray-700">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-plum">{toDelete.name}</span> (#{toDelete.userID},{' '}
            {toDelete.email})? This action cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  );
}
