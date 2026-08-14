import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Wrench, Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import {
  PageHeader, Button, Field, Input, Textarea, Select, Badge,
} from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatSlaHours } from '../../lib/format.js';
import { humanize, CATALOG_CATEGORIES, TEAMS, TEAM_OPTIONS } from '../../lib/constants.js';
import {
  listCatalog, createCatalogItem, updateCatalogItem, deleteCatalogItem,
} from '../../api/catalog.js';

const CATEGORY_SELECT = CATALOG_CATEGORIES.map((c) => ({ value: c, label: humanize(c) }));
const TEAM_SELECT = TEAM_OPTIONS.map((t) => ({ value: String(t.id), label: t.label }));

const emptyForm = {
  serviceName: '',
  category: CATALOG_CATEGORIES[0],
  description: '',
  fulfilmentSLAHours: '',
  approvalRequired: false,
  deliveryTeamID: '',
};

export default function CatalogBuilder() {
  const { data, loading, error, reload } = useAsync(listCatalog);
  const [editing, setEditing] = useState(null); // item being edited, or 'new'
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const items = useMemo(() => data || [], [data]);

  const openNew = () => {
    setForm(emptyForm);
    setEditing('new');
  };

  const openEdit = (item) => {
    setForm({
      serviceName: item.serviceName || '',
      category: item.category || CATALOG_CATEGORIES[0],
      description: item.description || '',
      fulfilmentSLAHours: item.fulfilmentSLAHours ?? '',
      approvalRequired: Boolean(item.approvalRequired),
      deliveryTeamID: item.deliveryTeamID != null ? String(item.deliveryTeamID) : '',
    });
    setEditing(item);
  };

  const closeForm = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.serviceName.trim()) {
      toast.error('Service name is required');
      return;
    }
    // NOTE: CatalogItemRequest has NO 'active' field — do not send it.
    const payload = {
      serviceName: form.serviceName.trim(),
      category: form.category,
      description: form.description.trim() || null,
      fulfilmentSLAHours: form.fulfilmentSLAHours === '' ? null : Number(form.fulfilmentSLAHours),
      approvalRequired: Boolean(form.approvalRequired),
      deliveryTeamID: form.deliveryTeamID === '' ? null : Number(form.deliveryTeamID),
    };
    setSaving(true);
    try {
      if (editing === 'new') {
        await createCatalogItem(payload);
        toast.success('Catalog item created');
      } else {
        await updateCatalogItem(editing.itemID, payload);
        toast.success('Catalog item updated');
      }
      closeForm();
      reload();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed to save catalog item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteCatalogItem(toDelete.itemID);
      toast.success('Catalog item deleted');
      setToDelete(null);
      reload();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed to delete catalog item');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'serviceName', header: 'Service Name', render: (i) => <span className="font-semibold text-plum">{i.serviceName}</span> },
    { key: 'category', header: 'Category', render: (i) => <Badge className="bg-slateblue-100 text-slateblue-700">{humanize(i.category)}</Badge> },
    { key: 'sla', header: 'SLA', render: (i) => formatSlaHours(i.fulfilmentSLAHours) },
    {
      key: 'approval',
      header: 'Approval',
      render: (i) =>
        i.approvalRequired ? (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
            <ShieldCheck size={13} /> Required
          </span>
        ) : (
          <span className="text-xs text-slateblue-400">Not required</span>
        ),
    },
    { key: 'team', header: 'Delivery Team', render: (i) => TEAMS[i.deliveryTeamID] || '—' },
    {
      key: 'active',
      header: 'Status',
      render: (i) =>
        i.active === false ? (
          <Badge className="bg-gray-100 text-gray-600">Inactive</Badge>
        ) : (
          <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (i) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(i)}>
            <Pencil size={14} /> Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setToDelete(i)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Service Catalog Builder"
        subtitle="Define and maintain the service catalog offerings"
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus size={16} /> New Item
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        error={error}
        onRetry={reload}
        rowKey={(i) => i.itemID}
        emptyIcon={Wrench}
        emptyTitle="No catalog items"
        emptyMessage="Create your first service catalog item to get started."
      />

      <Modal
        open={Boolean(editing)}
        onClose={closeForm}
        title={editing === 'new' ? 'New catalog item' : 'Edit catalog item'}
        subtitle={editing && editing !== 'new' ? `#${editing.itemID}` : 'Service offering'}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editing === 'new' ? 'Create item' : 'Save changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Service name" required>
            <Input value={form.serviceName} onChange={(e) => set('serviceName', e.target.value)} placeholder="e.g. New laptop provisioning" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" required>
              <Select value={form.category} onChange={(e) => set('category', e.target.value)} options={CATEGORY_SELECT} />
            </Field>
            <Field label="Fulfilment SLA (hours)">
              <Input type="number" min="0" value={form.fulfilmentSLAHours} onChange={(e) => set('fulfilmentSLAHours', e.target.value)} placeholder="e.g. 48" />
            </Field>
          </div>
          <Field label="Delivery team">
            <Select value={form.deliveryTeamID} onChange={(e) => set('deliveryTeamID', e.target.value)} placeholder="Select a team" options={TEAM_SELECT} />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe what this service provides…" />
          </Field>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.approvalRequired}
              onChange={(e) => set('approvalRequired', e.target.checked)}
              className="h-4 w-4 rounded border-slateblue-300 text-plum focus:ring-cyanaccent-400"
            />
            Approval required before fulfilment
          </label>
        </div>
      </Modal>

      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Delete catalog item"
        subtitle={toDelete ? toDelete.serviceName : ''}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              <Trash2 size={16} /> {deleting ? 'Deleting…' : 'Delete item'}
            </Button>
          </>
        }
      >
        {toDelete && (
          <p className="text-sm text-gray-700">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-plum">{toDelete.serviceName}</span> (#{toDelete.itemID})? This action cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  );
}
