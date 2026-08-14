import { useState } from 'react';
import toast from 'react-hot-toast';
import { UserCheck, Send, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import {
  PageHeader, Button, Field, Textarea, Loading, Tabs,
} from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Drawer from '../../components/ui/Drawer.jsx';
import Modal from '../../components/ui/Modal.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDateTime, slaCountdown, SLA_TONE_CLASS } from '../../lib/format.js';
import {
  humanize, PRIORITY_BADGE, INCIDENT_STATUS_BADGE, TEAMS,
} from '../../lib/constants.js';
import {
  listAssignedIncidents, listIncidentNotes, addIncidentNote, resolveIncident, closeIncident,
} from '../../api/incidents.js';

const CLOSED_STATUSES = ['RESOLVED', 'CLOSED'];

export default function MyTickets() {
  const { data, loading, error, reload } = useAsync(listAssignedIncidents);
  const [selected, setSelected] = useState(null);

  const columns = [
    { key: 'incidentID', header: 'ID', render: (r) => <span className="font-semibold text-plum">#{r.incidentID}</span> },
    { key: 'priority', header: 'Priority', render: (r) => <StatusBadge value={r.priority} map={PRIORITY_BADGE} /> },
    { key: 'category', header: 'Category', render: (r) => humanize(r.category) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} map={INCIDENT_STATUS_BADGE} /> },
    { key: 'reporterID', header: 'Reporter', render: (r) => <span className="text-slateblue-600">User #{r.reporterID}</span> },
    {
      key: 'sla', header: 'SLA', render: (r) => {
        if (CLOSED_STATUSES.includes(r.status)) return <span className="text-xs text-emerald-600">Met</span>;
        const s = slaCountdown(r.slaDueDate);
        return <span className={`text-xs ${SLA_TONE_CLASS[s.tone]}`}>{s.text}</span>;
      },
    },
  ];

  return (
    <div>
      <PageHeader title="My Assigned Tickets" subtitle="Work, update and resolve incidents assigned to you" />

      <DataTable
        columns={columns}
        rows={data}
        loading={loading}
        error={error}
        onRetry={reload}
        onRowClick={setSelected}
        rowKey={(r) => r.incidentID}
        emptyIcon={UserCheck}
        emptyTitle="No tickets assigned"
        emptyMessage="Self-assign incidents from the Incident Queue to start working."
      />

      <TicketActionDrawer
        incident={selected}
        onClose={() => setSelected(null)}
        onChanged={() => { reload(); setSelected(null); }}
      />
    </div>
  );
}

function TicketActionDrawer({ incident, onClose, onChanged }) {
  const open = Boolean(incident);
  const notes = useAsync(
    () => (incident ? listIncidentNotes(incident.incidentID) : Promise.resolve([])),
    [incident?.incidentID],
    { immediate: Boolean(incident) }
  );
  const [noteType, setNoteType] = useState('PUBLIC_UPDATE');
  const [noteText, setNoteText] = useState('');
  const [busy, setBusy] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  if (!incident) return <Drawer open={open} onClose={onClose} title="" />;

  const closed = CLOSED_STATUSES.includes(incident.status);

  const postNote = async () => {
    if (!noteText.trim()) return;
    setBusy(true);
    try {
      await addIncidentNote(incident.incidentID, { noteText: noteText.trim(), noteType });
      setNoteText('');
      toast.success(noteType === 'WORK_NOTE' ? 'Work note added' : 'Public update posted');
      notes.reload();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  const doResolve = async () => {
    if (!resolutionNote.trim()) return toast.error('Add a resolution note first');
    setBusy(true);
    try {
      await resolveIncident(incident.incidentID, resolutionNote.trim());
      toast.success(`Incident #${incident.incidentID} resolved`);
      setResolveOpen(false);
      setResolutionNote('');
      onChanged();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  const doClose = async () => {
    setBusy(true);
    try {
      await closeIncident(incident.incidentID);
      toast.success(`Incident #${incident.incidentID} closed`);
      onChanged();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={`Ticket #${incident.incidentID}`}
        subtitle={humanize(incident.category)}
        footer={
          !closed ? (
            <>
              <Button variant="secondary" size="sm" onClick={doClose} disabled={busy}>
                <XCircle size={14} /> Close
              </Button>
              <Button variant="accent" size="sm" onClick={() => setResolveOpen(true)} disabled={busy}>
                <CheckCircle2 size={14} /> Resolve
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={onClose}>Done</Button>
          )
        }
      >
        <div className="space-y-5 text-sm">
          <div className="flex items-center gap-2">
            <StatusBadge value={incident.priority} map={PRIORITY_BADGE} />
            <StatusBadge value={incident.status} map={INCIDENT_STATUS_BADGE} />
          </div>

          <p className="rounded-lg bg-mint px-4 py-3 text-gray-700">{incident.description}</p>

          <div className="grid grid-cols-2 gap-3 text-xs text-slateblue-600">
            <div><span className="block text-slateblue-400">Reporter</span>User #{incident.reporterID}</div>
            <div><span className="block text-slateblue-400">Team</span>{TEAMS[incident.assignedTeamID] || '—'}</div>
            <div><span className="block text-slateblue-400">Logged</span>{formatDateTime(incident.loggedDate)}</div>
            <div><span className="block text-slateblue-400">SLA due</span>{formatDateTime(incident.slaDueDate)}</div>
            {incident.resolutionDate && (
              <div><span className="block text-slateblue-400">Resolved</span>{formatDateTime(incident.resolutionDate)}</div>
            )}
          </div>

          {/* Notes */}
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

          {/* Add note */}
          {!closed && (
            <div className="rounded-xl border border-slateblue-100 p-3">
              <Tabs
                tabs={[
                  { value: 'PUBLIC_UPDATE', label: 'Public update' },
                  { value: 'WORK_NOTE', label: 'Work note' },
                ]}
                active={noteType}
                onChange={setNoteType}
              />
              <div className="mt-3">
                <Field hint={noteType === 'WORK_NOTE' ? 'Internal — not visible to the reporter.' : 'Visible to the reporter.'}>
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={2}
                    placeholder={noteType === 'WORK_NOTE' ? 'Add an internal work note…' : 'Add an update for the reporter…'}
                  />
                </Field>
                <div className="mt-2 flex justify-end">
                  <Button size="sm" onClick={postNote} disabled={busy}>
                    <Send size={14} /> Add note
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Drawer>

      <Modal
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        title={`Resolve incident #${incident.incidentID}`}
        subtitle="Record how this was fixed"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResolveOpen(false)}>Cancel</Button>
            <Button variant="accent" onClick={doResolve} disabled={busy}>
              <CheckCircle2 size={16} /> {busy ? 'Resolving…' : 'Resolve'}
            </Button>
          </>
        }
      >
        <Field label="Resolution note" required hint="Describe the resolution applied.">
          <Textarea
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            rows={4}
            placeholder="e.g. Reset the user's account and confirmed access restored."
          />
        </Field>
      </Modal>
    </>
  );
}
