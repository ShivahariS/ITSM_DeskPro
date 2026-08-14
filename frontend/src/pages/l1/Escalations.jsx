import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowUpRight } from 'lucide-react';
import {
  PageHeader, Button, Field, Input, Textarea, Select,
} from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDateTime, slaCountdown, SLA_TONE_CLASS } from '../../lib/format.js';
import {
  humanize, PRIORITY_BADGE, INCIDENT_STATUS_BADGE, TEAMS, TEAM_OPTIONS,
} from '../../lib/constants.js';
import { listIncidents, escalateIncident } from '../../api/incidents.js';

const CLOSED_STATUSES = ['RESOLVED', 'CLOSED'];

export default function Escalations() {
  const { data, loading, error, reload } = useAsync(listIncidents);
  const [target, setTarget] = useState(null);

  // Escalations are only meaningful for active (non-closed) incidents.
  const rows = useMemo(
    () => (data || []).filter((i) => !CLOSED_STATUSES.includes(i.status)),
    [data]
  );

  const columns = [
    { key: 'incidentID', header: 'ID', render: (r) => <span className="font-semibold text-plum">#{r.incidentID}</span> },
    { key: 'priority', header: 'Priority', render: (r) => <StatusBadge value={r.priority} map={PRIORITY_BADGE} /> },
    { key: 'category', header: 'Category', render: (r) => humanize(r.category) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} map={INCIDENT_STATUS_BADGE} /> },
    { key: 'assignedTeamID', header: 'Team', render: (r) => TEAMS[r.assignedTeamID] || '—' },
    {
      key: 'sla', header: 'SLA', render: (r) => {
        const s = slaCountdown(r.slaDueDate);
        return <span className={`text-xs ${SLA_TONE_CLASS[s.tone]}`}>{s.text}</span>;
      },
    },
    {
      key: 'actions', header: '', render: (r) => (
        <Button size="sm" onClick={() => setTarget(r)}>
          <ArrowUpRight size={14} /> Escalate
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Escalations & Hand-Offs" subtitle="Route incidents beyond first-line to L2/L3 engineers" />

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        rowKey={(r) => r.incidentID}
        emptyIcon={ArrowUpRight}
        emptyTitle="Nothing to escalate"
        emptyMessage="Active incidents will appear here when they need a hand-off."
      />

      <EscalateModal
        incident={target}
        onClose={() => setTarget(null)}
        onDone={() => { reload(); setTarget(null); }}
      />
    </div>
  );
}

function EscalateModal({ incident, onClose, onDone }) {
  const [assignedToID, setAssignedToID] = useState('');
  const [assignedTeamID, setAssignedTeamID] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  if (!incident) return null;

  const submit = async () => {
    const idNum = Number(assignedToID);
    if (!assignedToID || Number.isNaN(idNum) || idNum <= 0) {
      return toast.error('Enter a valid target engineer user ID');
    }
    setBusy(true);
    try {
      await escalateIncident(incident.incidentID, {
        assignedToID: idNum,
        assignedTeamID: assignedTeamID ? Number(assignedTeamID) : null,
        reason: reason.trim() || null,
      });
      toast.success(`Incident #${incident.incidentID} escalated`);
      onDone();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={Boolean(incident)}
      onClose={onClose}
      title={`Escalate incident #${incident.incidentID}`}
      subtitle={humanize(incident.category)}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>
            <ArrowUpRight size={16} /> {busy ? 'Escalating…' : 'Escalate'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="rounded-lg bg-mint px-4 py-3 text-sm text-gray-700">{incident.description}</p>

        <Field
          label="Target engineer user ID"
          required
          hint="Enter the numeric user ID of the L2/L3 engineer to hand off to."
        >
          <Input
            type="number"
            min="1"
            value={assignedToID}
            onChange={(e) => setAssignedToID(e.target.value)}
            placeholder="e.g. 12"
          />
        </Field>

        <Field label="Target team" hint="Optional — reassign the incident to a specialist team.">
          <Select
            value={assignedTeamID}
            onChange={(e) => setAssignedTeamID(e.target.value)}
            placeholder="Keep current team"
            options={TEAM_OPTIONS.map((t) => ({ value: t.id, label: t.label }))}
          />
        </Field>

        <Field label="Reason" hint="Added as an escalation note on the incident.">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Why is this being escalated?"
          />
        </Field>
      </div>
    </Modal>
  );
}
