import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { BookOpen, Plus, Pencil } from 'lucide-react';
import {
  PageHeader, Button, Field, Input, Textarea, Select,
} from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDate, truncate } from '../../lib/format.js';
import { humanize, KE_STATUS_BADGE, KNOWN_ERROR_STATUSES } from '../../lib/constants.js';
import { listKnownErrors, createKnownError, updateKnownError, listProblems } from '../../api/problems.js';

const EMPTY = { problemID: '', description: '', workaround: '', permanentFixETA: '', status: 'ACTIVE' };

export default function Kedb() {
  const { data, loading, error, reload } = useAsync(listKnownErrors);
  const problems = useAsync(listProblems);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = edit

  const problemTitle = useMemo(() => {
    const map = {};
    (problems.data || []).forEach((p) => (map[p.problemID] = p.title));
    return map;
  }, [problems.data]);

  const columns = [
    { key: 'keID', header: 'KE ID', render: (r) => <span className="font-semibold text-plum">#{r.keID}</span> },
    {
      key: 'problemID',
      header: 'Linked Problem',
      render: (r) => (
        <span className="text-gray-700">
          #{r.problemID}
          {problemTitle[r.problemID] && <span className="block text-xs text-slateblue-400">{truncate(problemTitle[r.problemID], 32)}</span>}
        </span>
      ),
    },
    { key: 'description', header: 'Description', render: (r) => truncate(r.description, 60) },
    { key: 'workaround', header: 'Workaround', render: (r) => truncate(r.workaround || '—', 50) },
    { key: 'permanentFixETA', header: 'Fix ETA', render: (r) => formatDate(r.permanentFixETA) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} map={KE_STATUS_BADGE} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setEditing(r);
          }}
        >
          <Pencil size={14} /> Edit
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Known Error Database"
        subtitle="Documented known errors, workarounds and permanent-fix timelines"
        actions={
          <Button onClick={() => setEditing({})}>
            <Plus size={16} /> New Known Error
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={data}
        loading={loading}
        error={error}
        onRetry={reload}
        onRowClick={setEditing}
        rowKey={(r) => r.keID}
        emptyIcon={BookOpen}
        emptyTitle="No known errors yet"
        emptyMessage="Record recurring issues and their workarounds to build the KEDB."
      />

      <KedbForm
        record={editing}
        problems={problems.data || []}
        onClose={() => setEditing(null)}
        onSaved={() => {
          reload();
          setEditing(null);
        }}
      />
    </div>
  );
}

function KedbForm({ record, problems, onClose, onSaved }) {
  const open = Boolean(record);
  const isEdit = Boolean(record && record.keID);

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [loadedId, setLoadedId] = useState(undefined);

  // Sync form when a different record opens (keyed on keID / new).
  const key = record ? record.keID ?? 'new' : undefined;
  if (open && key !== loadedId) {
    setForm({
      problemID: record.problemID != null ? String(record.problemID) : '',
      description: record.description || '',
      workaround: record.workaround || '',
      permanentFixETA: record.permanentFixETA ? String(record.permanentFixETA).slice(0, 10) : '',
      status: record.status || 'ACTIVE',
    });
    setErrors({});
    setLoadedId(key);
  }

  if (!open) return null;

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const submit = async () => {
    const er = {};
    if (!form.problemID) er.problemID = 'Select the linked problem.';
    if (!form.description.trim()) er.description = 'Description is required.';
    setErrors(er);
    if (Object.keys(er).length) return;

    const payload = {
      problemID: Number(form.problemID),
      description: form.description.trim(),
      workaround: form.workaround.trim() || null,
      permanentFixETA: form.permanentFixETA || null,
      status: form.status,
    };

    setBusy(true);
    try {
      if (isEdit) {
        await updateKnownError(record.keID, payload);
        toast.success(`Known error #${record.keID} updated`);
      } else {
        const created = await createKnownError(payload);
        toast.success(`Known error #${created.keID} created`);
      }
      onSaved();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    setLoadedId(undefined);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={isEdit ? `Edit Known Error #${record.keID}` : 'New Known Error'}
      subtitle="Capture the workaround and permanent-fix plan"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit} disabled={busy}>
            {isEdit ? 'Save changes' : 'Create known error'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Linked problem" required error={errors.problemID}>
          <Select
            name="problemID"
            value={form.problemID}
            onChange={onChange}
            placeholder="Select a problem record…"
            options={problems.map((p) => ({ value: String(p.problemID), label: `#${p.problemID} — ${truncate(p.title, 48)}` }))}
          />
        </Field>

        <Field label="Description" required error={errors.description}>
          <Textarea name="description" rows={3} value={form.description} onChange={onChange} placeholder="Describe the known error…" />
        </Field>

        <Field label="Workaround" hint="Temporary steps that restore service.">
          <Textarea name="workaround" rows={3} value={form.workaround} onChange={onChange} placeholder="Describe the workaround…" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Permanent fix ETA">
            <Input type="date" name="permanentFixETA" value={form.permanentFixETA} onChange={onChange} />
          </Field>

          <Field label="Status">
            <Select
              name="status"
              value={form.status}
              onChange={onChange}
              options={KNOWN_ERROR_STATUSES.map((s) => ({ value: s, label: humanize(s) }))}
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
