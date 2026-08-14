import { useState } from 'react';
import toast from 'react-hot-toast';
import { ServerCog, Plus, Pencil } from 'lucide-react';
import {
  PageHeader, Button, Field, Input, Select, Badge,
} from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import {
  humanize, ENVIRONMENTS, CI_STATUSES, CI_STATUS_BADGE,
} from '../../lib/constants.js';
import { listConfigItems, createConfigItem, updateConfigItem } from '../../api/assets.js';

// Environment badge tints (palette-aligned).
const ENV_BADGE = {
  PRODUCTION: 'bg-plum-100 text-plum-700',
  UAT: 'bg-amber-100 text-amber-800',
  DEV: 'bg-cyanaccent-100 text-cyanaccent-800',
};

const EMPTY = {
  ciName: '',
  ciType: '',
  linkedAssetID: '',
  owner: '',
  environment: 'PRODUCTION',
  dependsOnCIIDs: '',
  status: 'ACTIVE',
};

export default function Cmdb() {
  const { data, loading, error, reload } = useAsync(listConfigItems);
  const [editing, setEditing] = useState(null); // 'new' | ci | null
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setForm(EMPTY);
    setEditing('new');
  };

  const openEdit = (ci) => {
    setForm({
      ciName: ci.ciName || '',
      ciType: ci.ciType || '',
      linkedAssetID: ci.linkedAssetID ?? '',
      owner: ci.owner || '',
      environment: ci.environment || 'PRODUCTION',
      dependsOnCIIDs: ci.dependsOnCIIDs || '',
      status: ci.status || 'ACTIVE',
    });
    setEditing(ci);
  };

  const close = () => setEditing(null);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    if (!form.ciName.trim()) {
      toast.error('CI name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ciName: form.ciName.trim(),
        ciType: form.ciType.trim() || null,
        linkedAssetID: form.linkedAssetID === '' ? null : Number(form.linkedAssetID),
        owner: form.owner.trim() || null,
        environment: form.environment || null,
        dependsOnCIIDs: form.dependsOnCIIDs.trim() || null,
        status: form.status,
      };
      if (editing === 'new') {
        await createConfigItem(payload);
        toast.success('Configuration item created');
      } else {
        await updateConfigItem(editing.ciID, payload);
        toast.success('Configuration item updated');
      }
      close();
      reload();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed to save configuration item');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'ciName', header: 'CI Name', render: (r) => <span className="font-semibold text-plum">{r.ciName}</span> },
    { key: 'ciType', header: 'CI Type', render: (r) => r.ciType || '—' },
    { key: 'linkedAssetID', header: 'Linked Asset ID', render: (r) => (r.linkedAssetID != null ? `#${r.linkedAssetID}` : '—') },
    {
      key: 'environment',
      header: 'Environment',
      render: (r) => (r.environment ? <Badge className={ENV_BADGE[r.environment] || 'bg-slateblue-100 text-slateblue-700'}>{humanize(r.environment)}</Badge> : <span className="text-gray-400">—</span>),
    },
    { key: 'owner', header: 'Owner', render: (r) => r.owner || '—' },
    { key: 'dependsOnCIIDs', header: 'Depends-On CIs', render: (r) => r.dependsOnCIIDs || '—' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} map={CI_STATUS_BADGE} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <Button variant="ghost" size="sm" onClick={() => openEdit(r)} aria-label="Edit configuration item">
          <Pencil size={15} />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="CMDB Config Items"
        subtitle="Configuration item registry and dependency mapping"
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus size={16} /> Add CI
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={data}
        loading={loading}
        error={error}
        onRetry={reload}
        rowKey={(r) => r.ciID}
        emptyIcon={ServerCog}
        emptyTitle="No configuration items yet"
        emptyMessage="Register a configuration item to build out your CMDB."
      />

      <Modal
        open={Boolean(editing)}
        onClose={close}
        title={editing === 'new' ? 'Add Configuration Item' : `Edit CI: ${editing?.ciName}`}
        subtitle="Configuration item details"
        footer={
          <>
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CI name" required>
            <Input value={form.ciName} onChange={set('ciName')} placeholder="e.g. web-prod-01" />
          </Field>
          <Field label="CI type">
            <Input value={form.ciType} onChange={set('ciType')} placeholder="e.g. Application Server" />
          </Field>
          <Field label="Linked asset ID" hint="Numeric asset ID">
            <Input type="number" value={form.linkedAssetID} onChange={set('linkedAssetID')} placeholder="e.g. 12" />
          </Field>
          <Field label="Owner">
            <Input value={form.owner} onChange={set('owner')} placeholder="e.g. Platform Team" />
          </Field>
          <Field label="Environment">
            <Select value={form.environment} onChange={set('environment')} options={ENVIRONMENTS.map((v) => ({ value: v, label: humanize(v) }))} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={set('status')} options={CI_STATUSES.map((s) => ({ value: s, label: humanize(s) }))} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Depends-on CI IDs" hint="Comma-separated CI IDs, e.g. 3, 7, 11">
              <Input value={form.dependsOnCIIDs} onChange={set('dependsOnCIIDs')} placeholder="e.g. 3, 7, 11" />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
