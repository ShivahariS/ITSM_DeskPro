import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Layers, MessageSquare, Network, GitBranch, User, Tag, Link2, Unlink,
} from 'lucide-react';
import {
  PageHeader, Button, Field, Input, Textarea, Select, Loading, Badge, Tabs,
} from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Drawer from '../../components/ui/Drawer.jsx';
import Modal from '../../components/ui/Modal.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDateTime, slaCountdown, SLA_TONE_CLASS } from '../../lib/format.js';
import {
  humanize, INCIDENT_STATUS_BADGE, PRIORITY_BADGE, CI_STATUS_BADGE,
  PROBLEM_PRIORITIES,
} from '../../lib/constants.js';
import { listIncidents, listIncidentNotes } from '../../api/incidents.js';
import { listConfigItems } from '../../api/assets.js';
import { createProblem } from '../../api/problems.js';

const PRIORITY_FILTERS = ['ALL', 'P1', 'P2', 'IN_PROGRESS'];

// An incident is "escalated / needs L2" when it is P1/P2 or currently in progress,
// and is not already resolved or closed.
const needsL2 = (i) =>
  (i.priority === 'P1' || i.priority === 'P2' || i.status === 'IN_PROGRESS')
  && !['RESOLVED', 'CLOSED'].includes(i.status);

export default function EscalatedQueue() {
  const { data, loading, error, reload } = useAsync(listIncidents);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);

  const rows = useMemo(() => {
    const base = (data || []).filter(needsL2);
    if (filter === 'ALL') return base;
    if (filter === 'IN_PROGRESS') return base.filter((i) => i.status === 'IN_PROGRESS');
    return base.filter((i) => i.priority === filter);
  }, [data, filter]);

  const columns = [
    { key: 'incidentID', header: 'ID', render: (r) => <span className="font-semibold text-plum">#{r.incidentID}</span> },
    { key: 'priority', header: 'Priority', render: (r) => <StatusBadge value={r.priority} map={PRIORITY_BADGE} /> },
    { key: 'category', header: 'Category', render: (r) => humanize(r.category) },
    { key: 'reporter', header: 'Reporter', render: (r) => (r.reporterID != null ? `User #${r.reporterID}` : '—') },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} map={INCIDENT_STATUS_BADGE} /> },
    { key: 'logged', header: 'Logged', render: (r) => formatDateTime(r.loggedDate) },
    {
      key: 'sla', header: 'SLA', render: (r) => {
        const s = slaCountdown(r.slaDueDate);
        return <span className={`text-xs ${SLA_TONE_CLASS[s.tone]}`}>{s.text}</span>;
      },
    },
  ];

  return (
    <div>
      <PageHeader title="Escalated Queue" subtitle="Advanced incident inspection and problem conversion" />

      <div className="mb-4">
        <Tabs
          tabs={PRIORITY_FILTERS.map((f) => ({ value: f, label: f === 'ALL' ? 'All escalated' : humanize(f) }))}
          active={filter}
          onChange={setFilter}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        onRowClick={setSelected}
        rowKey={(r) => r.incidentID}
        emptyIcon={Layers}
        emptyTitle="Nothing escalated"
        emptyMessage="No incidents currently require L2 attention."
      />

      <InspectorDrawer
        incident={selected}
        onClose={() => setSelected(null)}
        onConverted={() => { reload(); setSelected(null); }}
      />
    </div>
  );
}

function InspectorDrawer({ incident, onClose, onConverted }) {
  const open = Boolean(incident);
  const notes = useAsync(
    () => (incident ? listIncidentNotes(incident.incidentID) : Promise.resolve([])),
    [incident?.incidentID],
    { immediate: Boolean(incident) }
  );
  const [tab, setTab] = useState('details');
  const [convertOpen, setConvertOpen] = useState(false);

  if (!incident) return <Drawer open={open} onClose={onClose} title="" />;

  const sla = slaCountdown(incident.slaDueDate);

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={`Advanced Inspector · #${incident.incidentID}`}
        subtitle={humanize(incident.category)}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button variant="accent" onClick={() => setConvertOpen(true)}>
              <GitBranch size={16} /> Convert to Problem
            </Button>
          </>
        }
      >
        <div className="mb-4">
          <Tabs
            tabs={[
              { value: 'details', label: 'Details' },
              { value: 'notes', label: 'History' },
              { value: 'ci', label: 'CI Linker' },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {tab === 'details' && (
          <div className="space-y-5 text-sm">
            <div className="flex items-center gap-2">
              <StatusBadge value={incident.priority} map={PRIORITY_BADGE} />
              <StatusBadge value={incident.status} map={INCIDENT_STATUS_BADGE} />
            </div>

            <p className="rounded-lg bg-mint px-4 py-3 text-gray-700">{incident.description}</p>

            <div className="grid grid-cols-2 gap-3 text-xs text-slateblue-600">
              <Detail label="Reporter" icon={User} value={incident.reporterID != null ? `User #${incident.reporterID}` : '—'} />
              <Detail label="Category" icon={Tag} value={humanize(incident.category)} />
              <Detail label="Assigned to" value={incident.assignedToID != null ? `User #${incident.assignedToID}` : '—'} />
              <Detail label="Assigned team" value={incident.assignedTeamID != null ? `Team #${incident.assignedTeamID}` : '—'} />
              <Detail label="Logged" value={formatDateTime(incident.loggedDate)} />
              <Detail label="SLA due" value={formatDateTime(incident.slaDueDate)} />
            </div>

            <div className="rounded-lg border border-slateblue-100 px-4 py-3">
              <p className="text-xs text-slateblue-400">SLA status</p>
              <p className={`text-sm ${SLA_TONE_CLASS[sla.tone]}`}>{sla.text}</p>
            </div>
          </div>
        )}

        {tab === 'notes' && (
          <div className="text-sm">
            <p className="mb-2 flex items-center gap-1.5 font-medium text-slateblue-500">
              <MessageSquare size={15} /> Historical notes
            </p>
            {notes.loading ? (
              <Loading label="Loading notes…" />
            ) : notes.error ? (
              <p className="rounded-lg border border-dashed border-red-200 px-4 py-3 text-center text-xs text-red-500">
                {notes.error}
              </p>
            ) : (notes.data || []).length === 0 ? (
              <p className="rounded-lg border border-dashed border-slateblue-200 px-4 py-3 text-center text-xs text-slateblue-400">
                No notes recorded for this incident.
              </p>
            ) : (
              <ul className="space-y-2">
                {(notes.data || []).map((n) => (
                  <li key={n.noteID} className="rounded-lg border border-slateblue-100 px-3 py-2">
                    <div className="mb-1 flex items-center justify-between text-[11px] text-slateblue-400">
                      <span>{humanize(n.noteType)} · {n.authorID != null ? `User #${n.authorID}` : 'System'}</span>
                      <span>{formatDateTime(n.createdDate)}</span>
                    </div>
                    <p className="text-gray-700">{n.noteText}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'ci' && <CiLinker />}
      </Drawer>

      <ConvertModal
        incident={incident}
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        onConverted={() => { setConvertOpen(false); onConverted(); }}
      />
    </>
  );
}

// CI Linker: read-only browse + display-only association (no backend link field exists).
function CiLinker() {
  const { data, loading, error, reload } = useAsync(listConfigItems);
  const [query, setQuery] = useState('');
  const [linkedId, setLinkedId] = useState(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = data || [];
    if (!q) return list;
    return list.filter((c) =>
      String(c.ciName || '').toLowerCase().includes(q)
      || String(c.ciType || '').toLowerCase().includes(q)
      || String(c.ciID).includes(q)
    );
  }, [data, query]);

  const linked = (data || []).find((c) => c.ciID === linkedId) || null;

  return (
    <div className="space-y-4 text-sm">
      <p className="flex items-center gap-1.5 font-medium text-slateblue-500">
        <Network size={15} /> Configuration item linker
      </p>
      <p className="text-xs text-slateblue-400">
        Browse the CMDB and associate a configuration item with this incident. Associations are shown here for
        analysis only — there is no persisted incident-to-CI field.
      </p>

      {linked && (
        <div className="rounded-lg border border-cyanaccent-200 bg-mint/60 px-4 py-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-plum">
              <Link2 size={13} /> Associated CI
            </span>
            <button
              type="button"
              onClick={() => setLinkedId(null)}
              className="flex items-center gap-1 text-xs text-slateblue-500 hover:text-red-500"
            >
              <Unlink size={12} /> Clear
            </button>
          </div>
          <p className="font-semibold text-plum">{linked.ciName} <span className="text-xs font-normal text-slateblue-400">#{linked.ciID}</span></p>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-slateblue-600">
            <span>Type: {linked.ciType || '—'}</span>
            {linked.environment && <Badge className="bg-slateblue-100 text-slateblue-700">{humanize(linked.environment)}</Badge>}
            <StatusBadge value={linked.status} map={CI_STATUS_BADGE} />
          </div>
          {linked.dependsOnCIIDs && (
            <p className="mt-1 text-xs text-slateblue-500">Depends on: {linked.dependsOnCIIDs}</p>
          )}
        </div>
      )}

      <Input placeholder="Search CIs by name, type or ID…" value={query} onChange={(e) => setQuery(e.target.value)} />

      {loading ? (
        <Loading label="Loading configuration items…" />
      ) : error ? (
        <p className="rounded-lg border border-dashed border-red-200 px-4 py-3 text-center text-xs text-red-500">
          {error} <button type="button" className="underline" onClick={reload}>Retry</button>
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slateblue-200 px-4 py-3 text-center text-xs text-slateblue-400">
          No matching configuration items.
        </p>
      ) : (
        <ul className="max-h-72 space-y-2 overflow-y-auto">
          {items.map((c) => (
            <li
              key={c.ciID}
              className="flex items-center justify-between gap-3 rounded-lg border border-slateblue-100 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-700">{c.ciName}</p>
                <p className="text-[11px] text-slateblue-400">
                  #{c.ciID} · {c.ciType || 'Unknown type'} · {c.environment ? humanize(c.environment) : 'No env'}
                </p>
              </div>
              <Button
                size="sm"
                variant={linkedId === c.ciID ? 'accent' : 'secondary'}
                onClick={() => setLinkedId(c.ciID)}
              >
                {linkedId === c.ciID ? 'Linked' : 'Link'}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ConvertModal({ incident, open, onClose, onConverted }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkedIncidentIDs, setLinkedIncidentIDs] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignedToID, setAssignedToID] = useState('');
  const [busy, setBusy] = useState(false);

  // Prefill from the incident whenever the modal opens.
  useEffect(() => {
    if (open && incident) {
      setTitle(`Problem from incident #${incident.incidentID}`);
      setDescription(incident.description || '');
      setLinkedIncidentIDs(String(incident.incidentID));
      setPriority(incident.priority === 'P1' ? 'HIGH' : incident.priority === 'P2' ? 'MEDIUM' : 'LOW');
      setAssignedToID('');
    }
  }, [open, incident]);

  const submit = async () => {
    if (!title.trim()) return toast.error('A problem title is required');
    setBusy(true);
    try {
      await createProblem({
        title: title.trim(),
        description: description.trim() || null,
        linkedIncidentIDs: linkedIncidentIDs.trim() || null,
        priority,
        assignedToID: assignedToID ? Number(assignedToID) : null,
      });
      toast.success('Problem record created');
      onConverted();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Convert to Problem"
      subtitle={incident ? `From incident #${incident.incidentID}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="accent" onClick={submit} disabled={busy}>
            {busy ? 'Creating…' : 'Create problem'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short problem summary" />
        </Field>
        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Linked incident IDs" hint="Comma-separated">
            <Input value={linkedIncidentIDs} onChange={(e) => setLinkedIncidentIDs(e.target.value)} placeholder="e.g. 12, 15" />
          </Field>
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value)} options={PROBLEM_PRIORITIES} />
          </Field>
        </div>
        <Field label="Assign to (user ID)" hint="Optional numeric user ID">
          <Input type="number" value={assignedToID} onChange={(e) => setAssignedToID(e.target.value)} placeholder="e.g. 3" />
        </Field>
      </div>
    </Modal>
  );
}

function Detail({ label, value, icon: Icon }) {
  return (
    <div>
      <span className="flex items-center gap-1 text-slateblue-400">
        {Icon && <Icon size={12} />} {label}
      </span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}
