import { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, ClipboardCheck } from 'lucide-react';
import {
  PageHeader, Card, Loading, ErrorState, EmptyState, Button,
  Field, Input, Textarea, Select,
} from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDateTime, truncate } from '../../lib/format.js';
import { humanize, IMPLEMENTATION_OUTCOMES } from '../../lib/constants.js';
import { listChanges, getImplementation, createImplementation } from '../../api/changes.js';

// Relevant lifecycle stages for post-implementation review.
const PIR_STATUSES = ['IMPLEMENTED', 'PIR_PENDING', 'CLOSED'];

// Palette-aligned badge classes for implementation outcomes.
const OUTCOME_BADGE = {
  SUCCESSFUL: 'bg-emerald-100 text-emerald-700',
  PARTIALLY_SUCCESSFUL: 'bg-amber-100 text-amber-800',
  FAILED: 'bg-red-100 text-red-700',
  ROLLED_BACK: 'bg-red-600 text-white',
};

// Fetch relevant changes, then their implementation records (404 => no record).
async function loadTracker() {
  const changes = await listChanges();
  const relevant = (changes || []).filter((c) => PIR_STATUSES.includes(c.status));
  const withImpl = await Promise.all(
    relevant.map(async (c) => {
      try {
        const impl = await getImplementation(c.changeID);
        return { change: c, impl };
      } catch {
        return { change: c, impl: null };
      }
    })
  );
  return withImpl;
}

export default function PirTracker() {
  const { data, loading, error, reload } = useAsync(loadTracker);
  const [recording, setRecording] = useState(null);
  const rows = data || [];

  const columns = [
    { key: 'changeID', header: 'Change ID', render: (r) => <span className="font-semibold text-plum">#{r.change.changeID}</span> },
    { key: 'title', header: 'Title', render: (r) => <span className="font-medium text-gray-700">{r.change.title}</span> },
    { key: 'start', header: 'Actual Start', render: (r) => formatDateTime(r.impl?.actualStartDate) },
    { key: 'end', header: 'Actual End', render: (r) => formatDateTime(r.impl?.actualEndDate) },
    {
      key: 'outcome', header: 'Outcome',
      render: (r) => (r.impl?.outcome ? <StatusBadge value={r.impl.outcome} map={OUTCOME_BADGE} /> : <span className="text-xs text-slateblue-400">Not recorded</span>),
    },
    { key: 'pir', header: 'PIR Comments', render: (r) => (r.impl?.pirComments ? truncate(r.impl.pirComments, 50) : '—') },
    {
      key: 'action', header: '',
      render: (r) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); setRecording(r.change); }}
        >
          {r.impl ? 'Update' : 'Record'}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="PIR & Implementation Tracker" subtitle="Post-implementation review of deployed changes" />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardCheck}
            title="Nothing to review yet"
            message="Implemented, PIR-pending and closed changes appear here for review."
          />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.change.changeID}
          emptyIcon={CheckCircle2}
          emptyTitle="Nothing to review yet"
        />
      )}

      <ImplementationModal
        change={recording}
        onClose={() => setRecording(null)}
        onDone={() => { reload(); setRecording(null); }}
      />
    </div>
  );
}

function ImplementationModal({ change, onClose, onDone }) {
  const open = Boolean(change);
  const [actualStartDate, setActualStartDate] = useState('');
  const [actualEndDate, setActualEndDate] = useState('');
  const [outcome, setOutcome] = useState('');
  const [pirComments, setPirComments] = useState('');
  const [busy, setBusy] = useState(false);

  if (!change) return <Modal open={open} onClose={onClose} title="" />;

  const submit = async () => {
    if (!outcome) return toast.error('Select an outcome');
    setBusy(true);
    try {
      await createImplementation(change.changeID, {
        actualStartDate: actualStartDate || null,
        actualEndDate: actualEndDate || null,
        outcome,
        pirComments: pirComments.trim() || null,
      });
      toast.success('Implementation recorded');
      onDone();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed to record implementation');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Record Implementation — Change #${change.changeID}`}
      subtitle={change.title}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="accent" size="sm" onClick={submit} disabled={busy}>Save record</Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Actual start">
            <Input type="datetime-local" value={actualStartDate} onChange={(e) => setActualStartDate(e.target.value)} />
          </Field>
          <Field label="Actual end">
            <Input type="datetime-local" value={actualEndDate} onChange={(e) => setActualEndDate(e.target.value)} />
          </Field>
        </div>

        <Field label="Outcome" required>
          <Select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="Select outcome…"
            options={IMPLEMENTATION_OUTCOMES.map((o) => ({ value: o, label: humanize(o) }))}
          />
        </Field>

        <Field label="PIR comments">
          <Textarea value={pirComments} onChange={(e) => setPirComments(e.target.value)} rows={4} placeholder="Post-implementation review notes…" />
        </Field>
      </div>
    </Modal>
  );
}
