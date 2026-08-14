import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Inbox, UserPlus, MessageSquare, Filter } from 'lucide-react';
import {
  PageHeader, Card, Button, Field, Select, Loading, Badge,
} from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Drawer from '../../components/ui/Drawer.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDateTime, slaCountdown, SLA_TONE_CLASS } from '../../lib/format.js';
import {
  humanize, PRIORITIES, INCIDENT_CATEGORIES, PRIORITY_BADGE, INCIDENT_STATUS_BADGE, TEAMS,
} from '../../lib/constants.js';
import { listIncidents, listIncidentNotes, assignIncident } from '../../api/incidents.js';

const CLOSED_STATUSES = ['RESOLVED', 'CLOSED'];

function SlaCell({ incident }) {
  if (CLOSED_STATUSES.includes(incident.status)) {
    return <span className="text-xs text-emerald-600">Met</span>;
  }
  const s = slaCountdown(incident.slaDueDate);
  return <span className={`text-xs ${SLA_TONE_CLASS[s.tone]}`}>{s.text}</span>;
}

export default function IncidentQueue() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(listIncidents);
  const [selected, setSelected] = useState(null);
  const [assigning, setAssigning] = useState(null);

  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [riskOnly, setRiskOnly] = useState(false);

  const rows = useMemo(() => {
    return (data || []).filter((i) => {
      if (priority && i.priority !== priority) return false;
      if (category && i.category !== category) return false;
      if (unassignedOnly && i.assignedToID != null) return false;
      if (riskOnly) {
        if (CLOSED_STATUSES.includes(i.status)) return false;
        const tone = slaCountdown(i.slaDueDate).tone;
        if (tone !== 'breached' && tone !== 'risk') return false;
      }
      return true;
    });
  }, [data, priority, category, unassignedOnly, riskOnly]);

  const selfAssign = async (incident) => {
    setAssigning(incident.incidentID);
    try {
      await assignIncident(incident.incidentID, user.userID);
      toast.success(`Incident #${incident.incidentID} assigned to you`);
      reload();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setAssigning(null);
    }
  };

  const columns = [
    { key: 'incidentID', header: 'ID', render: (r) => <span className="font-semibold text-plum">#{r.incidentID}</span> },
    { key: 'priority', header: 'Priority', render: (r) => <StatusBadge value={r.priority} map={PRIORITY_BADGE} /> },
    { key: 'category', header: 'Category', render: (r) => humanize(r.category) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} map={INCIDENT_STATUS_BADGE} /> },
    { key: 'reporterID', header: 'Reporter', render: (r) => <span className="text-slateblue-600">User #{r.reporterID}</span> },
    {
      key: 'assignedToID', header: 'Assigned', render: (r) =>
        r.assignedToID != null
          ? <span className="text-slateblue-700">User #{r.assignedToID}</span>
          : <Badge className="bg-amber-100 text-amber-800">Unassigned</Badge>,
    },
    { key: 'sla', header: 'SLA', render: (r) => <SlaCell incident={r} /> },
    {
      key: 'actions', header: '', render: (r) =>
        r.assignedToID == null ? (
          <Button
            size="sm"
            variant="accent"
            disabled={assigning === r.incidentID}
            onClick={(e) => { e.stopPropagation(); selfAssign(r); }}
          >
            <UserPlus size={14} /> Self-Assign
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Incident Queue" subtitle="Triage and assign incoming incidents across the service desk" />

      {/* Filter toolbar */}
      <Card className="mb-5 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-slateblue-600">
            <Filter size={15} /> Filters
          </span>
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value)} placeholder="All priorities" options={PRIORITIES} />
          </Field>
          <Field label="Category">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="All categories"
              options={INCIDENT_CATEGORIES.map((c) => ({ value: c, label: humanize(c) }))}
            />
          </Field>
          <label className="flex items-center gap-2 pb-2.5 text-sm text-slateblue-600">
            <input type="checkbox" checked={unassignedOnly} onChange={(e) => setUnassignedOnly(e.target.checked)} className="h-4 w-4 rounded border-slateblue-300 text-cyanaccent-500" />
            Unassigned only
          </label>
          <label className="flex items-center gap-2 pb-2.5 text-sm text-slateblue-600">
            <input type="checkbox" checked={riskOnly} onChange={(e) => setRiskOnly(e.target.checked)} className="h-4 w-4 rounded border-slateblue-300 text-cyanaccent-500" />
            SLA breach risk
          </label>
          {(priority || category || unassignedOnly || riskOnly) && (
            <Button
              size="sm"
              variant="ghost"
              className="mb-1"
              onClick={() => { setPriority(''); setCategory(''); setUnassignedOnly(false); setRiskOnly(false); }}
            >
              Clear
            </Button>
          )}
        </div>
      </Card>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        onRowClick={setSelected}
        rowKey={(r) => r.incidentID}
        emptyIcon={Inbox}
        emptyTitle="No incidents match"
        emptyMessage="Adjust the filters to see more of the queue."
      />

      <IncidentDrawer incident={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function IncidentDrawer({ incident, onClose }) {
  const open = Boolean(incident);
  const notes = useAsync(
    () => (incident ? listIncidentNotes(incident.incidentID) : Promise.resolve([])),
    [incident?.incidentID],
    { immediate: Boolean(incident) }
  );

  if (!incident) return <Drawer open={open} onClose={onClose} title="" />;

  return (
    <Drawer open={open} onClose={onClose} title={`Incident #${incident.incidentID}`} subtitle={humanize(incident.category)}>
      <div className="space-y-5 text-sm">
        <div className="flex items-center gap-2">
          <StatusBadge value={incident.priority} map={PRIORITY_BADGE} />
          <StatusBadge value={incident.status} map={INCIDENT_STATUS_BADGE} />
        </div>

        <p className="rounded-lg bg-mint px-4 py-3 text-gray-700">{incident.description}</p>

        <div className="grid grid-cols-2 gap-3 text-xs text-slateblue-600">
          <div><span className="block text-slateblue-400">Reporter</span>User #{incident.reporterID}</div>
          <div><span className="block text-slateblue-400">Assigned to</span>{incident.assignedToID != null ? `User #${incident.assignedToID}` : 'Unassigned'}</div>
          <div><span className="block text-slateblue-400">Team</span>{TEAMS[incident.assignedTeamID] || '—'}</div>
          <div><span className="block text-slateblue-400">Logged</span>{formatDateTime(incident.loggedDate)}</div>
          <div><span className="block text-slateblue-400">SLA due</span>{formatDateTime(incident.slaDueDate)}</div>
          {incident.resolutionDate && (
            <div><span className="block text-slateblue-400">Resolved</span>{formatDateTime(incident.resolutionDate)}</div>
          )}
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 font-medium text-slateblue-500">
            <MessageSquare size={15} /> Notes & activity
          </p>
          {notes.loading ? (
            <Loading label="Loading notes…" />
          ) : (notes.data || []).length === 0 ? (
            <p className="rounded-lg border border-dashed border-slateblue-200 px-4 py-3 text-center text-xs text-slateblue-400">
              No notes yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {notes.data.map((n) => (
                <li key={n.noteID} className="rounded-lg border border-slateblue-100 px-3 py-2">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-slateblue-400">
                    <span>{humanize(n.noteType)} · User #{n.authorID}</span>
                    <span>{formatDateTime(n.createdDate)}</span>
                  </div>
                  <p className="text-gray-700">{n.noteText}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Drawer>
  );
}
