import { useState } from 'react';
import toast from 'react-hot-toast';
import { ClipboardCheck, Gavel } from 'lucide-react';
import {
  PageHeader, Card, CardHeader, Loading, ErrorState, EmptyState, Button,
  Field, Input, Textarea, Select,
} from '../../components/ui/index.jsx';
import Modal from '../../components/ui/Modal.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDateTime } from '../../lib/format.js';
import {
  humanize, CAB_DECISIONS, RISK_BADGE, CHANGE_STATUS_BADGE,
} from '../../lib/constants.js';
import {
  listChangesByStatus, createCabReview, listCabReviews, updateChangeStatus,
} from '../../api/changes.js';

export default function CabConsole() {
  const { data, loading, error, reload } = useAsync(() => listChangesByStatus('CAB_REVIEW'));
  const [reviewing, setReviewing] = useState(null);
  const changes = data || [];

  return (
    <div>
      <PageHeader title="CAB Review Console" subtitle="Conduct advisory board reviews for pending changes" />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : changes.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardCheck}
            title="No changes awaiting review"
            message="Changes submitted to the CAB will appear here for review."
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {changes.map((c) => (
            <Card key={c.changeID} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-plum">#{c.changeID} — {c.title}</p>
                  <p className="mt-1 text-xs text-slateblue-500">
                    {humanize(c.changeType)} · Requested by {c.requestedByID != null ? `User #${c.requestedByID}` : '—'}
                  </p>
                </div>
                <StatusBadge value={c.riskLevel} map={RISK_BADGE} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slateblue-600">
                <StatusBadge value={c.status} map={CHANGE_STATUS_BADGE} />
                <span>Window: {formatDateTime(c.plannedStartDate)} – {formatDateTime(c.plannedEndDate)}</span>
              </div>

              {c.impactAssessment && (
                <p className="mt-3 rounded-lg bg-mint px-3 py-2 text-xs text-gray-700">{c.impactAssessment}</p>
              )}

              <div className="mt-4 flex justify-end">
                <Button size="sm" onClick={() => setReviewing(c)}>
                  <Gavel size={14} /> Conduct Review
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ReviewModal
        change={reviewing}
        onClose={() => setReviewing(null)}
        onDone={() => { reload(); setReviewing(null); }}
      />
    </div>
  );
}

function ReviewModal({ change, onClose, onDone }) {
  const open = Boolean(change);
  const past = useAsync(
    () => (change ? listCabReviews(change.changeID) : Promise.resolve([])),
    [change?.changeID],
    { immediate: Boolean(change) }
  );
  const [reviewDate, setReviewDate] = useState('');
  const [attendeeIDs, setAttendeeIDs] = useState('');
  const [decision, setDecision] = useState('');
  const [comments, setComments] = useState('');
  const [busy, setBusy] = useState(false);

  if (!change) return <Modal open={open} onClose={onClose} title="" />;

  const submit = async () => {
    if (!decision) return toast.error('Select a decision');
    setBusy(true);
    try {
      await createCabReview(change.changeID, {
        reviewDate: reviewDate || null,
        attendeeIDs: attendeeIDs.trim() || null,
        decision,
        comments: comments.trim() || null,
      });
      // Reflect an approval on the change record for a smoother pipeline.
      if (decision === 'APPROVED') {
        try {
          await updateChangeStatus(change.changeID, 'APPROVED');
        } catch {
          /* status transition is best-effort; review is already recorded */
        }
      }
      toast.success('Review recorded');
      onDone();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed to record review');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`CAB Review — Change #${change.changeID}`}
      subtitle={change.title}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="accent" size="sm" onClick={submit} disabled={busy}>Record review</Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Review date">
            <Input type="datetime-local" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
          </Field>
          <Field label="Decision" required>
            <Select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              placeholder="Select decision…"
              options={CAB_DECISIONS.map((d) => ({ value: d, label: humanize(d) }))}
            />
          </Field>
        </div>

        <Field label="Attendee IDs" hint="Comma-separated user IDs">
          <Input value={attendeeIDs} onChange={(e) => setAttendeeIDs(e.target.value)} placeholder="e.g. 4, 5, 7" />
        </Field>

        <Field label="Comments">
          <Textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={3} placeholder="Board notes and rationale…" />
        </Field>

        {/* Past reviews */}
        <div>
          <p className="mb-2 font-medium text-slateblue-500">Previous reviews</p>
          {past.loading ? (
            <Loading label="Loading reviews…" />
          ) : (past.data || []).length === 0 ? (
            <p className="rounded-lg border border-dashed border-slateblue-200 px-4 py-3 text-center text-xs text-slateblue-400">
              No prior reviews for this change.
            </p>
          ) : (
            <ul className="space-y-2">
              {(past.data || []).map((r) => (
                <li key={r.reviewID} className="rounded-lg border border-slateblue-100 px-3 py-2">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-slateblue-400">
                    <span>{humanize(r.decision)}</span>
                    <span>{formatDateTime(r.reviewDate)}</span>
                  </div>
                  {r.attendeeIDs && <p className="text-xs text-slateblue-500">Attendees: {r.attendeeIDs}</p>}
                  {r.comments && <p className="mt-1 text-gray-700">{r.comments}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
