import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { GitPullRequest, Send } from 'lucide-react';
import { PageHeader, Field, Select, Button } from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Drawer from '../../components/ui/Drawer.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDateTime } from '../../lib/format.js';
import {
  humanize, CHANGE_STATUSES, CHANGE_STATUS_BADGE, RISK_BADGE,
} from '../../lib/constants.js';
import { listChanges, submitChange, updateChangeStatus } from '../../api/changes.js';

// Status transitions offered from the drawer (target statuses via updateChangeStatus).
const TRANSITIONS = ['APPROVED', 'SCHEDULED', 'IMPLEMENTED', 'PIR_PENDING', 'CLOSED', 'REJECTED'];

export default function ChangeQueue() {
  const { data, loading, error, reload } = useAsync(listChanges);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const rows = useMemo(() => {
    const all = data || [];
    return statusFilter === 'ALL' ? all : all.filter((c) => c.status === statusFilter);
  }, [data, statusFilter]);

  const columns = [
    { key: 'changeID', header: 'Change ID', render: (r) => <span className="font-semibold text-plum">#{r.changeID}</span> },
    { key: 'title', header: 'Title', render: (r) => <span className="font-medium text-gray-700">{r.title}</span> },
    { key: 'changeType', header: 'Type', render: (r) => humanize(r.changeType) },
    { key: 'requestedByID', header: 'Requested By', render: (r) => (r.requestedByID != null ? `User #${r.requestedByID}` : '—') },
    { key: 'riskLevel', header: 'Risk', render: (r) => <StatusBadge value={r.riskLevel} map={RISK_BADGE} /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} map={CHANGE_STATUS_BADGE} /> },
  ];

  return (
    <div>
      <PageHeader title="Change Requests Queue" subtitle="Review and drive changes through their lifecycle" />

      <div className="mb-4 max-w-xs">
        <Field label="Filter by status">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={['ALL', ...CHANGE_STATUSES].map((s) => ({ value: s, label: s === 'ALL' ? 'All statuses' : humanize(s) }))}
          />
        </Field>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        onRowClick={setSelected}
        rowKey={(r) => r.changeID}
        emptyIcon={GitPullRequest}
        emptyTitle="No change requests"
        emptyMessage="Change requests matching this filter will appear here."
      />

      <ChangeDrawer
        change={selected}
        onClose={() => setSelected(null)}
        onChanged={() => { reload(); setSelected(null); }}
      />
    </div>
  );
}

function ChangeDrawer({ change, onClose, onChanged }) {
  const open = Boolean(change);
  const [busy, setBusy] = useState(false);
  const [target, setTarget] = useState('');

  if (!change) return <Drawer open={open} onClose={onClose} title="" />;

  const canSubmit = ['DRAFT', 'SUBMITTED'].includes(change.status);

  const doSubmit = async () => {
    setBusy(true);
    try {
      await submitChange(change.changeID);
      toast.success('Submitted to CAB');
      onChanged();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed to submit change');
    } finally {
      setBusy(false);
    }
  };

  const doTransition = async () => {
    if (!target) return toast.error('Select a status first');
    setBusy(true);
    try {
      await updateChangeStatus(change.changeID, target);
      toast.success(`Status set to ${humanize(target)}`);
      onChanged();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed to update status');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Change #${change.changeID}`}
      subtitle={change.title}
    >
      <div className="space-y-5 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge value={change.status} map={CHANGE_STATUS_BADGE} />
          <StatusBadge value={change.riskLevel} map={RISK_BADGE} />
          <span className="rounded-full bg-slateblue-100 px-2 py-0.5 text-[11px] font-semibold text-slateblue-700">
            {humanize(change.changeType)}
          </span>
        </div>

        <DetailRow label="Requested by" value={change.requestedByID != null ? `User #${change.requestedByID}` : '—'} />

        <div className="grid grid-cols-2 gap-3 text-xs text-slateblue-600">
          <div><span className="block text-slateblue-400">Planned start</span>{formatDateTime(change.plannedStartDate)}</div>
          <div><span className="block text-slateblue-400">Planned end</span>{formatDateTime(change.plannedEndDate)}</div>
        </div>

        <Section title="Description" body={change.description} />
        <Section title="Impact assessment" body={change.impactAssessment} />
        <Section title="Rollback plan" body={change.rollbackPlan} />

        {/* Actions */}
        <div className="space-y-3 rounded-xl border border-cyanaccent-200 bg-mint/50 p-4">
          <p className="text-sm font-semibold text-plum">Actions</p>

          {canSubmit && (
            <Button size="sm" onClick={doSubmit} disabled={busy}>
              <Send size={14} /> Submit to CAB
            </Button>
          )}

          <Field label="Transition status">
            <Select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Select target status…"
              options={TRANSITIONS.map((s) => ({ value: s, label: humanize(s) }))}
            />
          </Field>
          <div className="flex justify-end">
            <Button variant="accent" size="sm" onClick={doTransition} disabled={busy || !target}>
              Update status
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slateblue-500">{label}</span>
      <span className="font-medium text-gray-700">{value || '—'}</span>
    </div>
  );
}

function Section({ title, body }) {
  return (
    <div>
      <p className="mb-1 font-medium text-slateblue-500">{title}</p>
      <p className="rounded-lg bg-mint px-4 py-3 text-gray-700">{body || 'Not provided.'}</p>
    </div>
  );
}
