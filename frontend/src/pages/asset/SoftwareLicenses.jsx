import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  PageHeader, Button, Field, Input, Select,
} from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { formatDate } from '../../lib/format.js';
import {
  humanize, LICENSE_STATUSES, LICENSE_STATUS_BADGE,
} from '../../lib/constants.js';
import { listLicenses, createLicense, updateLicense } from '../../api/assets.js';

const EMPTY = {
  softwareName: '',
  vendor: '',
  expiryDate: '',
  status: 'ACTIVE',
};

const asDate = (v) => (v ? String(v).slice(0, 10) : '');

export default function SoftwareLicenses() {
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get('userId') || '';
  const [selectedUserId, setSelectedUserId] = useState(queryUserId);
  const [userLicenses, setUserLicenses] = useState([]);
  const [editing, setEditing] = useState(null); // 'new' | license object | null
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  // Sync with URL query parameter changes
  useEffect(() => {
    if (queryUserId) {
      setSelectedUserId(queryUserId);
    }
  }, [queryUserId]);

  // Load user licenses when selectedUserId changes
  useEffect(() => {
    if (selectedUserId) {
      listLicenses()
        .then((allLics) => {
          const filtered = (allLics || []).filter(
            (l) => String(l.assignedToID || l.assignedToId) === String(selectedUserId)
          ).map(l => ({
            id: l.licenseID || l.licenseId || l.id,
            softwareName: l.softwareName,
            vendor: l.vendor,
            expiryDate: l.expiryDate,
            status: l.status,
          }));
          if (filtered.length > 0) {
            setUserLicenses(filtered);
            localStorage.setItem('user_licenses_' + selectedUserId, JSON.stringify(filtered));
          } else {
            // Fallback to local storage if none in database
            const stored = localStorage.getItem('user_licenses_' + selectedUserId);
            if (stored) {
              setUserLicenses(JSON.parse(stored));
            } else {
              setUserLicenses([]);
            }
          }
        })
        .catch(() => {
          const stored = localStorage.getItem('user_licenses_' + selectedUserId);
          if (stored) {
            setUserLicenses(JSON.parse(stored));
          } else {
            setUserLicenses([]);
          }
        });
    } else {
      setUserLicenses([]);
    }
  }, [selectedUserId]);

  const openNew = () => {
    setForm(EMPTY);
    setEditing('new');
  };

  const openEdit = (lic) => {
    setForm({
      softwareName: lic.softwareName || '',
      vendor: lic.vendor || '',
      expiryDate: asDate(lic.expiryDate),
      status: lic.status || 'ACTIVE',
    });
    setEditing(lic);
  };

  const close = () => setEditing(null);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    if (!form.softwareName.trim()) {
      toast.error('software name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        softwareName: form.softwareName.trim(),
        vendor: form.vendor.trim() || '—',
        expiryDate: form.expiryDate || null,
        status: form.status || 'ACTIVE',
        assignedToID: Number(selectedUserId)
      };

      let savedLic;
      if (editing === 'new') {
        savedLic = await createLicense(payload);
      } else {
        savedLic = await updateLicense(editing.id || editing.licenseID || editing.licenseId, payload);
      }

      const newLicense = {
        id: savedLic.licenseID || savedLic.licenseId || savedLic.id || (editing === 'new' ? Date.now() : editing.id),
        softwareName: payload.softwareName,
        vendor: payload.vendor,
        expiryDate: payload.expiryDate,
        status: payload.status,
      };

      let newList = [...userLicenses];
      if (editing === 'new') {
        newList.push(newLicense);
      } else {
        newList = newList.map((item) => (item.id === editing.id || item.licenseID === editing.licenseID || item.licenseId === editing.licenseId) ? newLicense : item);
      }

      localStorage.setItem('user_licenses_' + selectedUserId, JSON.stringify(newList));
      setUserLicenses(newList);
      toast.success(editing === 'new' ? 'License allocated to user' : 'License updated');
      close();
    } catch (e) {
      toast.error('Failed to save license allocation');
    } finally {
      setSaving(false);
    }
  };

  const removeAllocation = (lic) => {
    if (!window.confirm(`Remove ${lic.softwareName} allocation for User #${selectedUserId}?`)) return;
    const newList = userLicenses.filter((item) => item.id !== lic.id);
    localStorage.setItem('user_licenses_' + selectedUserId, JSON.stringify(newList));
    setUserLicenses(newList);
    toast.success('License allocation removed');
  };

  const columns = [
    { key: 'softwareName', header: 'Software Name', render: (r) => <span className="font-semibold text-plum">{r.softwareName}</span> },
    { key: 'vendor', header: 'Vendor', render: (r) => r.vendor || '—' },
    { key: 'expiryDate', header: 'Expiry Date', render: (r) => formatDate(r.expiryDate) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} map={LICENSE_STATUS_BADGE} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)} aria-label="Edit license">
            <Pencil size={15} />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => removeAllocation(r)} aria-label="Delete license">
            <Trash2 size={15} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Software Licenses"
        subtitle="Manage license allocations for users"
        actions={
          selectedUserId && (
            <Button size="sm" onClick={openNew}>
              <Plus size={16} /> Add License
            </Button>
          )
        }
      />

      {/* User Selector Header */}
      <div className="mb-6 max-w-xs bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <Field label="Manage Licenses for User ID">
          <Input
            type="number"
            placeholder="Enter User ID (e.g. 2)"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          />
        </Field>
      </div>

      {!selectedUserId ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-500 shadow-sm">
          <KeyRound className="mx-auto mb-3 text-slate-400 h-10 w-10 animate-bounce" />
          <h3 className="font-semibold text-slate-700">No User Selected</h3>
          <p className="text-sm mt-1 text-slate-500 max-w-sm mx-auto">
            Please enter a User ID above to manage their allocated software licenses.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={userLicenses}
          rowKey={(r) => r.id}
          emptyIcon={KeyRound}
          emptyTitle="No allocated licenses"
          emptyMessage={`User #${selectedUserId} does not have any allocated software licenses yet. Click 'Add License' to allocate one.`}
        />
      )}

      <Modal
        open={Boolean(editing)}
        onClose={close}
        title={editing === 'new' ? 'Add License' : `Edit License: ${editing?.softwareName}`}
        subtitle={`Software license details for User #${selectedUserId}`}
        footer={
          <>
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Software name" required>
            <Input value={form.softwareName} onChange={set('softwareName')} placeholder="e.g. Microsoft 365" />
          </Field>
          <Field label="Vendor">
            <Input value={form.vendor} onChange={set('vendor')} placeholder="e.g. Microsoft" />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={set('status')} options={LICENSE_STATUSES.map((s) => ({ value: s, label: humanize(s) }))} />
          </Field>
          <Field label="Expiry date">
            <Input type="date" value={form.expiryDate} onChange={set('expiryDate')} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
