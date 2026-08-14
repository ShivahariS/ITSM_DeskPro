import { useState } from 'react';
import toast from 'react-hot-toast';
import { Ticket, Send, RotateCcw, Star, MessageSquare } from 'lucide-react';
import { PageHeader, Button, Field, Textarea, Loading } from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Drawer from '../../components/ui/Drawer.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDateTime, slaCountdown, SLA_TONE_CLASS } from '../../lib/format.js';
import { humanize, INCIDENT_STATUS_BADGE, PRIORITY_BADGE } from '../../lib/constants.js';
import {
  listMyIncidents, listIncidentNotes, addIncidentNote, reopenIncident, submitSatisfaction,
} from '../../api/incidents.js';

export default function MyTickets() {
  const { data, loading, error, reload } = useAsync(listMyIncidents);
  const [selected, setSelected] = useState(null);

  const columns = [
    { key: 'incidentID', header: 'ID', render: (r) => <span className="font-semibold text-plum">#{r.incidentID}</span> },
    { key: 'priority', header: 'Priority', render: (r) => <StatusBadge value={r.priority} map={PRIORITY_BADGE} /> },
    { key: 'category', header: 'Category', render: (r) => humanize(r.category) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} map={INCIDENT_STATUS_BADGE} /> },
    {
      key: 'sla', header: 'SLA', render: (r) => {
        if (['RESOLVED', 'CLOSED'].includes(r.status)) return <span className="text-xs text-emerald-600">Met</span>;
        const s = slaCountdown(r.slaDueDate);
        return <span className={`text-xs ${SLA_TONE_CLASS[s.tone]}`}>{s.text}</span>;
      },
    },
  ];

  return (
    <div>
      <PageHeader title="My Tickets" subtitle="Manage reported incidents and rate resolutions" />

      <DataTable
        columns={columns}
        rows={data}
        loading={loading}
        error={error}
        onRetry={reload}
        onRowClick={setSelected}
        rowKey={(r) => r.incidentID}
        emptyIcon={Ticket}
        emptyTitle="No tickets yet"
        emptyMessage="Reported incidents will appear here."
      />

      <TicketDrawer
        incident={selected}
        onClose={() => setSelected(null)}
        onChanged={() => { reload(); setSelected(null); }}
      />
    </div>
  );
}

function TicketDrawer({ incident, onClose, onChanged }) {
  const open = Boolean(incident);
  const notes = useAsync(
    () => (incident ? listIncidentNotes(incident.incidentID) : Promise.resolve([])),
    [incident?.incidentID],
    { immediate: Boolean(incident) }
  );
  const [noteText, setNoteText] = useState('');
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');

  if (!incident) return <Drawer open={open} onClose={onClose} title="" />;

  const resolved = ['RESOLVED', 'CLOSED'].includes(incident.status);
  const publicNotes = (notes.data || []).filter((n) => n.noteType !== 'WORK_NOTE');

  const addNote = async () => {
    if (!noteText.trim()) return;
    setBusy(true);
    try {
      await addIncidentNote(incident.incidentID, { noteText: noteText.trim(), noteType: 'PUBLIC_UPDATE' });
      setNoteText('');
      toast.success('Update added');
      notes.reload();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  const reopen = async () => {
    setBusy(true);
    try {
      await reopenIncident(incident.incidentID);
      toast.success('Ticket reopened');
      onChanged();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  const rate = async () => {
    if (!rating) return toast.error('Select a star rating first');
    setBusy(true);
    try {
      await submitSatisfaction(incident.incidentID, { rating, feedback: feedback.trim() || null });
      toast.success('Thanks for your feedback!');
      onChanged();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Incident #${incident.incidentID}`}
      subtitle={humanize(incident.category)}
    >
      <div className="space-y-5 text-sm">
        <div className="flex items-center gap-2">
          <StatusBadge value={incident.priority} map={PRIORITY_BADGE} />
          <StatusBadge value={incident.status} map={INCIDENT_STATUS_BADGE} />
        </div>

        <p className="rounded-lg bg-mint px-4 py-3 text-gray-700">{incident.description}</p>

        <div className="grid grid-cols-2 gap-3 text-xs text-slateblue-600">
          <div><span className="block text-slateblue-400">Logged</span>{formatDateTime(incident.loggedDate)}</div>
          <div><span className="block text-slateblue-400">SLA due</span>{formatDateTime(incident.slaDueDate)}</div>
          {incident.resolutionDate && (
            <div><span className="block text-slateblue-400">Resolved</span>{formatDateTime(incident.resolutionDate)}</div>
          )}
        </div>

        {/* Conversation */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 font-medium text-slateblue-500">
            <MessageSquare size={15} /> Conversation
          </p>
          {notes.loading ? (
            <Loading label="Loading updates…" />
          ) : publicNotes.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slateblue-200 px-4 py-3 text-center text-xs text-slateblue-400">
              No public updates yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {publicNotes.map((n) => (
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

          {!resolved && (
            <div className="mt-3">
              <Field label="Add an update">
                <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2} placeholder="Add a note for the support team…" />
              </Field>
              <div className="mt-2 flex justify-end">
                <Button size="sm" onClick={addNote} disabled={busy}>
                  <Send size={14} /> Post update
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Resolved actions: reopen + CSAT */}
        {resolved && (
          <div className="space-y-4 rounded-xl border border-cyanaccent-200 bg-mint/50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-plum">Rate this resolution</p>
              <Button variant="secondary" size="sm" onClick={reopen} disabled={busy}>
                <RotateCcw size={14} /> Reopen
              </Button>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  aria-label={`${star} star`}
                >
                  <Star
                    size={28}
                    className={(hover || rating) >= star ? 'fill-cyanaccent-400 text-cyanaccent-500' : 'text-slateblue-300'}
                  />
                </button>
              ))}
            </div>
            <Field label="Feedback (optional)">
              <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={2} placeholder="How was your experience?" />
            </Field>
            <div className="flex justify-end">
              <Button variant="accent" size="sm" onClick={rate} disabled={busy}>
                Submit rating
              </Button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
