import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ShieldAlert, MessageSquare, Send, CheckCircle2, FileText, Link2, Flame,
} from 'lucide-react';
import {
  PageHeader, Button, Field, Textarea, Loading, StatCard,
} from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Drawer from '../../components/ui/Drawer.jsx';
import Modal from '../../components/ui/Modal.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDateTime, slaCountdown, SLA_TONE_CLASS } from '../../lib/format.js';
import { humanize, INCIDENT_STATUS_BADGE, PRIORITY_BADGE, TEAMS } from '../../lib/constants.js';
import {
  listIncidents, listIncidentNotes, addIncidentNote, resolveIncident,
} from '../../api/incidents.js';
import { listProblems } from '../../api/problems.js';

const RCA_PREFIX = 'RCA: ';
const CLOSED_STATES = ['RESOLVED', 'CLOSED'];

export default function MajorIncidents() {
  const { data, loading, error, reload } = useAsync(listIncidents);
  const problems = useAsync(listProblems);
  const [selected, setSelected] = useState(null);

  const majors = useMemo(
    () =>
      (data || [])
        .filter((i) => ['P1', 'P2'].includes(i.priority) && !CLOSED_STATES.includes(i.status))
        .sort((a, b) => (a.priority < b.priority ? -1 : 1)),
    [data]
  );

  // Map incidentID -> related ProblemRecord (linkedIncidentIDs is a delimited string).
  const relatedProblem = useMemo(() => {
    const map = {};
    (problems.data || []).forEach((p) => {
      String(p.linkedIncidentIDs || '')
        .split(/[,;\s]+/)
        .filter(Boolean)
        .forEach((id) => {
          map[id] = p;
        });
    });
    return map;
  }, [problems.data]);

  const p1Count = majors.filter((i) => i.priority === 'P1').length;
  const p2Count = majors.filter((i) => i.priority === 'P2').length;
  const breached = majors.filter((i) => slaCountdown(i.slaDueDate).tone === 'breached').length;

  const columns = [
    { key: 'incidentID', header: 'ID', render: (r) => <span className="font-semibold text-plum">#{r.incidentID}</span> },
    { key: 'priority', header: 'Priority', render: (r) => <StatusBadge value={r.priority} map={PRIORITY_BADGE} /> },
    { key: 'description', header: 'Description', render: (r) => <span className="text-gray-700">{truncateText(r.description, 60)}</span> },
    { key: 'category', header: 'Category', render: (r) => humanize(r.category) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} map={INCIDENT_STATUS_BADGE} /> },
    { key: 'team', header: 'Team', render: (r) => TEAMS[r.assignedTeamID] || '—' },
    {
      key: 'sla',
      header: 'SLA',
      render: (r) => {
        const s = slaCountdown(r.slaDueDate);
        return <span className={`text-xs ${SLA_TONE_CLASS[s.tone]}`}>{s.text}</span>;
      },
    },
    {
      key: 'problem',
      header: 'Problem',
      render: (r) =>
        relatedProblem[String(r.incidentID)] ? (
          <span className="inline-flex items-center gap-1 text-xs text-plum">
            <Link2 size={13} /> #{relatedProblem[String(r.incidentID)].problemID}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Major Incident Workbench"
        subtitle="Command centre for active P1 / P2 incidents — investigate, record RCA, and resolve"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Active P1 incidents" value={p1Count} icon={Flame} tone="danger" hint="Critical, business-wide impact" />
        <StatCard label="Active P2 incidents" value={p2Count} icon={ShieldAlert} tone="warn" hint="High impact to a team or service" />
        <StatCard label="SLA breached" value={breached} icon={ShieldAlert} tone={breached ? 'danger' : 'success'} hint="Past the resolution target" />
      </div>

      <DataTable
        columns={columns}
        rows={majors}
        loading={loading || problems.loading}
        error={error}
        onRetry={reload}
        onRowClick={setSelected}
        rowKey={(r) => r.incidentID}
        emptyIcon={ShieldAlert}
        emptyTitle="No active major incidents"
        emptyMessage="P1 and P2 incidents awaiting resolution will appear here."
      />

      <IncidentDrawer
        incident={selected}
        problem={selected ? relatedProblem[String(selected.incidentID)] : null}
        onClose={() => setSelected(null)}
        onResolved={() => {
          reload();
          setSelected(null);
        }}
      />
    </div>
  );
}

function truncateText(text, len) {
  const str = String(text ?? '');
  return str.length > len ? `${str.slice(0, len).trimEnd()}…` : str;
}

function IncidentDrawer({ incident, problem, onClose, onResolved }) {
  const open = Boolean(incident);
  const notes = useAsync(
    () => (incident ? listIncidentNotes(incident.incidentID) : Promise.resolve([])),
    [incident?.incidentID],
    { immediate: Boolean(incident) }
  );
  const [noteText, setNoteText] = useState('');
  const [rca, setRca] = useState('');
  const [busy, setBusy] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  if (!incident) return <Drawer open={open} onClose={onClose} title="" />;

  const all = notes.data || [];
  const rcaNotes = all.filter((n) => n.noteType === 'WORK_NOTE' && String(n.noteText).startsWith(RCA_PREFIX));
  const timeline = all.filter((n) => !(n.noteType === 'WORK_NOTE' && String(n.noteText).startsWith(RCA_PREFIX)));

  const addWorkNote = async () => {
    if (!noteText.trim()) return;
    setBusy(true);
    try {
      await addIncidentNote(incident.incidentID, { noteText: noteText.trim(), noteType: 'WORK_NOTE' });
      setNoteText('');
      toast.success('Work note added');
      notes.reload();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  const saveRca = async () => {
    if (!rca.trim()) return toast.error('Enter RCA details first');
    setBusy(true);
    try {
      await addIncidentNote(incident.incidentID, { noteText: `${RCA_PREFIX}${rca.trim()}`, noteType: 'WORK_NOTE' });
      setRca('');
      toast.success('RCA record saved');
      notes.reload();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  const resolve = async () => {
    setBusy(true);
    try {
      await resolveIncident(incident.incidentID, resolutionNote.trim() || null);
      toast.success(`Incident #${incident.incidentID} resolved`);
      setResolveOpen(false);
      setResolutionNote('');
      onResolved();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  const sla = slaCountdown(incident.slaDueDate);

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={`Incident #${incident.incidentID}`}
        subtitle={humanize(incident.category)}
        footer={
          <Button onClick={() => setResolveOpen(true)} disabled={busy}>
            <CheckCircle2 size={16} /> Resolve
          </Button>
        }
      >
        <div className="space-y-5 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={incident.priority} map={PRIORITY_BADGE} />
            <StatusBadge value={incident.status} map={INCIDENT_STATUS_BADGE} />
            <span className={`text-xs ${SLA_TONE_CLASS[sla.tone]}`}>{sla.text}</span>
          </div>

          <p className="rounded-lg bg-mint px-4 py-3 text-gray-700">{incident.description}</p>

          <div className="grid grid-cols-2 gap-3 text-xs text-slateblue-600">
            <div><span className="block text-slateblue-400">Logged</span>{formatDateTime(incident.loggedDate)}</div>
            <div><span className="block text-slateblue-400">SLA due</span>{formatDateTime(incident.slaDueDate)}</div>
            <div><span className="block text-slateblue-400">Assigned team</span>{TEAMS[incident.assignedTeamID] || '—'}</div>
            <div><span className="block text-slateblue-400">Assignee ID</span>{incident.assignedToID ? `#${incident.assignedToID}` : '—'}</div>
          </div>

          {/* Related problem */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 font-medium text-slateblue-500">
              <Link2 size={15} /> Linked problem
            </p>
            {problem ? (
              <div className="rounded-lg border border-plum-100 bg-plum-50 px-3 py-2">
                <p className="text-sm font-semibold text-plum">#{problem.problemID} — {problem.title}</p>
                <p className="mt-0.5 text-xs text-slateblue-500">{humanize(problem.status)} · {humanize(problem.priority)} priority</p>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-slateblue-200 px-4 py-3 text-center text-xs text-slateblue-400">
                No linked problem record.
              </p>
            )}
          </div>

          {/* RCA Record Editor */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 font-medium text-slateblue-500">
              <FileText size={15} /> RCA Record Editor
            </p>
            {rcaNotes.length > 0 && (
              <ul className="mb-3 space-y-2">
                {rcaNotes.map((n) => (
                  <li key={n.noteID} className="rounded-lg border border-cyanaccent-200 bg-mint/50 px-3 py-2">
                    <div className="mb-1 text-[11px] text-slateblue-400">{formatDateTime(n.createdDate)}</div>
                    <p className="text-gray-700">{String(n.noteText).slice(RCA_PREFIX.length)}</p>
                  </li>
                ))}
              </ul>
            )}
            <Field label="Root cause analysis" hint="Saved as a WORK_NOTE prefixed with 'RCA: '.">
              <Textarea value={rca} onChange={(e) => setRca(e.target.value)} rows={4} placeholder="Document the root cause, contributing factors and permanent fix…" />
            </Field>
            <div className="mt-2 flex justify-end">
              <Button variant="accent" size="sm" onClick={saveRca} disabled={busy}>
                <FileText size={14} /> Save RCA
              </Button>
            </div>
          </div>

          {/* Work notes timeline */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 font-medium text-slateblue-500">
              <MessageSquare size={15} /> Notes &amp; activity
            </p>
            {notes.loading ? (
              <Loading label="Loading notes…" />
            ) : timeline.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slateblue-200 px-4 py-3 text-center text-xs text-slateblue-400">
                No notes yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {timeline.map((n) => (
                  <li key={n.noteID} className="rounded-lg border border-slateblue-100 px-3 py-2">
                    <div className="mb-1 flex items-center justify-between text-[11px] text-slateblue-400">
                      <span>{humanize(n.noteType)}</span>
                      <span>{formatDateTime(n.createdDate)}</span>
                    </div>
                    <p className="text-gray-700">{n.noteText}</p>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3">
              <Field label="Add work note">
                <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2} placeholder="Add an internal work note…" />
              </Field>
              <div className="mt-2 flex justify-end">
                <Button size="sm" onClick={addWorkNote} disabled={busy}>
                  <Send size={14} /> Post note
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Drawer>

      <Modal
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        title={`Resolve incident #${incident.incidentID}`}
        subtitle="Record the resolution applied"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setResolveOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button size="sm" onClick={resolve} disabled={busy}>
              <CheckCircle2 size={14} /> Confirm resolve
            </Button>
          </>
        }
      >
        <Field label="Resolution note" hint="Describe the fix applied so it is captured on the incident.">
          <Textarea value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} rows={4} placeholder="What resolved the incident?" />
        </Field>
      </Modal>
    </>
  );
}
