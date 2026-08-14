import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Boxes, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  PageHeader, Button, Field, Input, Select,
} from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDate } from '../../lib/format.js';
import {
  humanize, ASSET_TYPES, ASSET_STATUSES, ASSET_STATUS_BADGE, LOCATIONS,
} from '../../lib/constants.js';
import { listAssets, createAsset, updateAsset, deleteAsset } from '../../api/assets.js';

const EMPTY = {
  assetType: 'LAPTOP',
  make: '',
  model: '',
  serialNumber: '',
  assignedToID: '',
  locationID: '',
  purchaseDate: '',
  warrantyExpiry: '',
  status: 'IN_STOCK',
};

const asDate = (v) => (v ? String(v).slice(0, 10) : '');

export default function HardwareInventory() {
  const { data, loading, error, reload } = useAsync(listAssets);
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get('userId') || '';

  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUserType, setFilterUserType] = useState(queryUserId ? 'specific' : '');
  const [filterSpecificUserId, setFilterSpecificUserId] = useState(queryUserId);

  useEffect(() => {
    if (queryUserId) {
      setFilterUserType('specific');
      setFilterSpecificUserId(queryUserId);
    }
  }, [queryUserId]);

  const [editing, setEditing] = useState(null); // 'new' | asset object | null
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const filteredData = useMemo(() => {
    return (data || []).filter((item) => {
      if (filterType && item.assetType !== filterType) {
        return false;
      }
      if (filterStatus && item.status !== filterStatus) {
        return false;
      }
      if (filterUserType) {
        if (filterUserType === 'unassigned') {
          if (item.assignedToID != null) return false;
        } else if (filterUserType === 'assigned') {
          if (item.assignedToID == null) return false;
        } else if (filterUserType === 'specific') {
          if (filterSpecificUserId !== '') {
            if (String(item.assignedToID) !== String(filterSpecificUserId)) {
              return false;
            }
          }
        }
      }
      return true;
    });
  }, [data, filterType, filterStatus, filterUserType, filterSpecificUserId]);

  const openNew = () => {
    setForm(EMPTY);
    setEditing('new');
  };

  const openEdit = (asset) => {
    setForm({
      assetType: asset.assetType || 'LAPTOP',
      make: asset.make || '',
      model: asset.model || '',
      serialNumber: asset.serialNumber || '',
      assignedToID: asset.assignedToID ?? '',
      locationID: asset.locationID || '',
      purchaseDate: asDate(asset.purchaseDate),
      warrantyExpiry: asDate(asset.warrantyExpiry),
      status: asset.status || 'IN_STOCK',
    });
    setEditing(asset);
  };

  const close = () => setEditing(null);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        assetType: form.assetType,
        make: form.make.trim() || null,
        model: form.model.trim() || null,
        serialNumber: form.serialNumber.trim() || null,
        assignedToID: form.assignedToID === '' ? null : Number(form.assignedToID),
        locationID: form.locationID || null,
        purchaseDate: form.purchaseDate || null,
        warrantyExpiry: form.warrantyExpiry || null,
        status: form.status,
      };
      if (editing === 'new') {
        await createAsset(payload);
        toast.success('Asset created');
      } else {
        await updateAsset(editing.assetID, payload);
        toast.success('Asset updated');
      }
      close();
      reload();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed to save asset');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (asset) => {
    if (!window.confirm(`Delete asset #${asset.assetID}${asset.serialNumber ? ` (${asset.serialNumber})` : ''}? This cannot be undone.`)) return;
    try {
      await deleteAsset(asset.assetID);
      toast.success('Asset deleted');
      reload();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed to delete asset');
    }
  };

  const columns = [
    { key: 'assetID', header: 'Asset ID', render: (r) => <span className="font-semibold text-plum">#{r.assetID}</span> },
    { key: 'assetType', header: 'Type', render: (r) => humanize(r.assetType) },
    { key: 'makeModel', header: 'Make / Model', render: (r) => [r.make, r.model].filter(Boolean).join(' ') || '—' },
    { key: 'serialNumber', header: 'Serial Number', render: (r) => r.serialNumber || '—' },
    { key: 'assignedToID', header: 'Assigned User', render: (r) => (r.assignedToID != null ? `User #${r.assignedToID}` : 'Unassigned') },
    { key: 'locationID', header: 'Location', render: (r) => r.locationID || '—' },
    { key: 'purchaseDate', header: 'Purchase Date', render: (r) => formatDate(r.purchaseDate) },
    { key: 'warrantyExpiry', header: 'Warranty Expiry', render: (r) => formatDate(r.warrantyExpiry) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} map={ASSET_STATUS_BADGE} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)} aria-label="Edit asset">
            <Pencil size={15} />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => remove(r)} aria-label="Delete asset">
            <Trash2 size={15} />
          </Button>
        </div>
      ),
    },
  ];

  const hasActiveFilters = Boolean(filterType || filterStatus || filterUserType);
  const emptyTitle = hasActiveFilters ? "No assets match filters" : "No assets yet";
  const emptyMessage = hasActiveFilters 
    ? "Try adjusting your filter options to see more hardware assets."
    : "Add your first hardware asset to start tracking inventory.";

  return (
    <div>
      <PageHeader
        title="Hardware Inventory"
        subtitle="Track laptops, servers, network devices and peripherals"
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus size={16} /> Add Asset
          </Button>
        }
      />

      {/* Filters Bar */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <Field label="Filter by Type">
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            placeholder="All Types"
            options={ASSET_TYPES.map((t) => ({ value: t, label: humanize(t) }))}
          />
        </Field>
        <Field label="Filter by Status">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            placeholder="All Statuses"
            options={ASSET_STATUSES.map((s) => ({ value: s, label: humanize(s) }))}
          />
        </Field>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Field label="Filter by Assignment">
              <Select
                value={filterUserType}
                onChange={(e) => {
                  setFilterUserType(e.target.value);
                  if (e.target.value !== 'specific') {
                    setFilterSpecificUserId('');
                  }
                }}
                placeholder="All Assets"
                options={[
                  { value: 'unassigned', label: 'Unassigned' },
                  { value: 'assigned', label: 'Assigned (Any User)' },
                  { value: 'specific', label: 'Specific User ID' }
                ]}
              />
            </Field>
          </div>
          {filterUserType === 'specific' && (
            <div className="w-24">
              <Field label="User ID">
                <Input
                  type="number"
                  placeholder="e.g. 2"
                  value={filterSpecificUserId}
                  onChange={(e) => setFilterSpecificUserId(e.target.value)}
                />
              </Field>
            </div>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filteredData}
        loading={loading}
        error={error}
        onRetry={reload}
        rowKey={(r) => r.assetID}
        emptyIcon={Boxes}
        emptyTitle={emptyTitle}
        emptyMessage={emptyMessage}
      />

      <Modal
        open={Boolean(editing)}
        onClose={close}
        title={editing === 'new' ? 'Add Asset' : `Edit Asset #${editing?.assetID}`}
        subtitle="Hardware asset details"
        footer={
          <>
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Asset type" required>
            <Select value={form.assetType} onChange={set('assetType')} options={ASSET_TYPES.map((t) => ({ value: t, label: humanize(t) }))} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={set('status')} options={ASSET_STATUSES.map((s) => ({ value: s, label: humanize(s) }))} />
          </Field>
          <Field label="Make">
            <Input value={form.make} onChange={set('make')} placeholder="e.g. Dell" />
          </Field>
          <Field label="Model">
            <Input value={form.model} onChange={set('model')} placeholder="e.g. Latitude 7440" />
          </Field>
          <Field label="Serial number">
            <Input value={form.serialNumber} onChange={set('serialNumber')} placeholder="e.g. SN-00123" />
          </Field>
          <Field label="Assigned user ID" hint="Numeric user ID (leave blank if unassigned)">
            <Input type="number" value={form.assignedToID} onChange={set('assignedToID')} placeholder="e.g. 42" />
          </Field>
          <Field label="Location">
            <Select value={form.locationID} onChange={set('locationID')} placeholder="Select location…" options={LOCATIONS} />
          </Field>
          <Field label="Purchase date">
            <Input type="date" value={form.purchaseDate} onChange={set('purchaseDate')} />
          </Field>
          <Field label="Warranty expiry">
            <Input type="date" value={form.warrantyExpiry} onChange={set('warrantyExpiry')} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
