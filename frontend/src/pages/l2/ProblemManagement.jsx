import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ShieldAlert, Plus, FileText } from 'lucide-react';
import {
  PageHeader, Button, Field, Input, Textarea, Select,
} from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Drawer from '../../components/ui/Drawer.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDateTime, truncate } from '../../lib/format.js';
import {
  humanize, PROBLEM_PRIORITIES, PROBLEM_STATUSES,
  PROBLEM_STATUS_BADGE, PRIORITY_BADGE,
} from '../../lib/constants.js';
import { listProblems, createProblem, updateProblem, updateProblemStatus } from '../../api/problems.js';

// Reuse the priority badge map (HIGH/MEDIUM/LOW fall back to the generic badge).
const PROBLEM_PRIORITY_BADGE = {
  HIGH: PRIORITY_BADGE.P1,
  MEDIUM: PRIORITY_BADGE.P2,
  LOW: PRIORITY_BADGE.P4,
};

export default function ProblemManagement() {
  const { data, loading, error, reload } = useAsync(listProblems);
  const [editing, setEditing] = useState(null); // problem object, or {} for new

  const columns = [
    { key: 'problemID', header: 'ID', render: (r) => <span className="font-semibold text-plum">#{r.problemID}</span> },
    { key: 'title', header: 'Title', render: (r) => <span className="font-medium text-gray-700">{truncate(r.title, 48)}</span> },
    { key: 'linked', header: 'Linked Incidents', render: (r) => r.linkedIncidentIDs || '—' },
    { key: 'priority', header: 'Priority', render: (r) => <StatusBadge value={r.priority} map={PROBLEM_PRIORITY_BADGE} /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} map={PROBLEM_STATUS_BADGE} /> },
    { key: 'rootCause', header: 'Root Cause', render: (r) => (r.rootCause ? truncate(r.rootCause, 50) : <span className="text-slateblue-300">Not documented</span>) },
    { key: 'raised', header: 'Raised', render: (r) => formatDateTime(r.raisedDate) },
  ];

  return (
    <div>
      <PageHeader
        title="Problem Management"
        subtitle="Root-cause analysis and problem lifecycle"
        actions={
          <Button onClick={() => setEditing({})}>
            <Plus size={16} /> New Problem
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
        rowKey={(r) => r.problemID}
        emptyIcon={ShieldAlert}
        emptyTitle="No problem records"
        emptyMessage="Create a problem record to begin root-cause analysis."
      />

      <ProblemDrawer
        problem={editing}
        onClose={() => setEditing(null)}
        onSaved={() => { reload(); setEditing(null); }}
      />
    </div>
  );
}

function ProblemDrawer({ problem, onClose, onSaved }) {
  const open = Boolean(problem);
  const isNew = Boolean(problem) && problem.problemID == null;

  const [form, setForm] = useState({
    title: '', description: '', linkedIncidentIDs: '', priority: 'MEDIUM', assignedToID: '',
  });
  const [status, setStatus] = useState('OPEN');
  const [rootCause, setRootCause] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!problem) return;
    setForm({
      title: problem.title || '',
      description: problem.description || '',
      linkedIncidentIDs: problem.linkedIncidentIDs || '',
      priority: problem.priority || 'MEDIUM',
      assignedToID: problem.assignedToID != null ? String(problem.assignedToID) : '',
    });
    setStatus(problem.status || 'OPEN');
    setRootCause(problem.rootCause || '');
  }, [problem]);

  if (!problem) return <Drawer open={open} onClose={onClose} title="" />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const saveDetails = async () => {
    if (!form.title.trim()) return toast.error('A title is required');
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        linkedIncidentIDs: form.linkedIncidentIDs.trim() || null,
        priority: form.priority,
        assignedToID: form.assignedToID ? Number(form.assignedToID) : null,
      };
      if (isNew) {
        await createProblem(payload);
        toast.success('Problem record created');
      } else {
        await updateProblem(problem.problemID, payload);
        toast.success('Problem updated');
      }
      onSaved();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  const saveStatus = async () => {
    setBusy(true);
    try {
      await updateProblemStatus(problem.problemID, status, rootCause.trim() || null);
      toast.success('Status & root cause updated');
      onSaved();
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
      title={isNew ? 'New Problem Record' : `Problem #${problem.problemID}`}
      subtitle={isNew ? 'Document a new problem' : humanize(problem.status)}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={saveDetails} disabled={busy}>
            {busy ? 'Saving…' : isNew ? 'Create problem' : 'Save details'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {!isNew && (
          <div className="flex items-center gap-2">
            <StatusBadge value={form.priority} map={PROBLEM_PRIORITY_BADGE} />
            <StatusBadge value={status} map={PROBLEM_STATUS_BADGE} />
          </div>
        )}

        <Field label="Title" required>
          <Input value={form.title} onChange={set('title')} placeholder="Short problem summary" />
        </Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={set('description')} rows={4} placeholder="What is the problem?" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Linked incident IDs" hint="Comma-separated">
            <Input value={form.linkedIncidentIDs} onChange={set('linkedIncidentIDs')} placeholder="e.g. 12, 15" />
          </Field>
          <Field label="Priority">
            <Select value={form.priority} onChange={set('priority')} options={PROBLEM_PRIORITIES} />
          </Field>
        </div>
        <Field label="Assign to (user ID)" hint="Optional numeric user ID">
          <Input type="number" value={form.assignedToID} onChange={set('assignedToID')} placeholder="e.g. 3" />
        </Field>

        {/* Status + RCA — only for existing records */}
        {!isNew && (
          <div className="space-y-4 rounded-xl border border-slateblue-100 bg-mint/40 p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-plum">
              <FileText size={15} /> Status & Root Cause Analysis
            </p>
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                {PROBLEM_STATUSES.map((s) => (
                  <option key={s} value={s}>{humanize(s)}</option>
                ))}
              </Select>
            </Field>
            <Field label="RCA documentation" hint="Findings, corrective and preventive actions">
              <Textarea value={rootCause} onChange={(e) => setRootCause(e.target.value)} rows={5} placeholder="Document the root cause and resolution…" />
            </Field>
            <div className="flex items-center justify-between text-xs text-slateblue-400">
              <span>Raised {formatDateTime(problem.raisedDate)}</span>
              {problem.resolvedDate && <span>Resolved {formatDateTime(problem.resolvedDate)}</span>}
            </div>
            <div className="flex justify-end">
              <Button variant="accent" size="sm" onClick={saveStatus} disabled={busy}>
                Update status & RCA
              </Button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
