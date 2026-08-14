import { useState } from 'react';
import toast from 'react-hot-toast';
import { GitPullRequest, Send, ClipboardList, ShieldAlert, CalendarClock } from 'lucide-react';
import {
  PageHeader, Card, CardHeader, Field, Input, Textarea, Select, Button,
} from '../../components/ui/index.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { formatDateTime } from '../../lib/format.js';
import { humanize, CHANGE_TYPES, RISK_LEVELS, RISK_BADGE } from '../../lib/constants.js';
import { createChange } from '../../api/changes.js';

const EMPTY = {
  title: '',
  description: '',
  changeType: 'NORMAL',
  impactAssessment: '',
  riskLevel: 'MEDIUM',
  rollbackPlan: '',
  plannedStartDate: '',
  plannedEndDate: '',
};

const CHANGE_TYPE_HINT = {
  STANDARD: 'Pre-approved, low-risk, routine change.',
  NORMAL: 'Requires assessment and CAB review.',
  EMERGENCY: 'Expedited change to restore service.',
};

export default function RequestChange() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!form.title.trim()) er.title = 'A title is required.';
    if (form.plannedStartDate && form.plannedEndDate && form.plannedEndDate < form.plannedStartDate) {
      er.plannedEndDate = 'End must be after the start.';
    }
    setErrors(er);
    if (Object.keys(er).length) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      changeType: form.changeType,
      impactAssessment: form.impactAssessment.trim() || null,
      riskLevel: form.riskLevel,
      rollbackPlan: form.rollbackPlan.trim() || null,
      plannedStartDate: form.plannedStartDate || null,
      plannedEndDate: form.plannedEndDate || null,
    };

    setSubmitting(true);
    try {
      const created = await createChange(payload);
      toast.success(`Change request #${created.changeID} created (draft)`);
      setForm(EMPTY);
      setErrors({});
    } catch (err) {
      toast.error(err.friendlyMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Request a Change"
        subtitle="Raise a change request for engineering work and infrastructure updates"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <form onSubmit={onSubmit} className="space-y-5">
            <Field label="Title" required error={errors.title}>
              <Input name="title" value={form.title} onChange={onChange} placeholder="e.g. Upgrade payments service to v3.2" />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Change type" required hint={CHANGE_TYPE_HINT[form.changeType]}>
                <Select
                  name="changeType"
                  value={form.changeType}
                  onChange={onChange}
                  options={CHANGE_TYPES.map((c) => ({ value: c, label: humanize(c) }))}
                />
              </Field>
              <Field label="Risk level" required>
                <Select
                  name="riskLevel"
                  value={form.riskLevel}
                  onChange={onChange}
                  options={RISK_LEVELS.map((r) => ({ value: r, label: humanize(r) }))}
                />
              </Field>
            </div>

            <Field label="Description">
              <Textarea name="description" rows={4} value={form.description} onChange={onChange} placeholder="What is changing and why?" />
            </Field>

            <Field label="Impact assessment" hint="Systems, users and services affected.">
              <Textarea name="impactAssessment" rows={3} value={form.impactAssessment} onChange={onChange} placeholder="Describe the expected impact…" />
            </Field>

            <Field label="Rollback plan" hint="How the change is reversed if it fails.">
              <Textarea name="rollbackPlan" rows={3} value={form.rollbackPlan} onChange={onChange} placeholder="Describe the rollback steps…" />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Planned start">
                <Input type="datetime-local" name="plannedStartDate" value={form.plannedStartDate} onChange={onChange} />
              </Field>
              <Field label="Planned end" error={errors.plannedEndDate}>
                <Input type="datetime-local" name="plannedEndDate" value={form.plannedEndDate} onChange={onChange} />
              </Field>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => { setForm(EMPTY); setErrors({}); }} disabled={submitting}>
                Reset
              </Button>
              <Button type="submit" disabled={submitting}>
                <Send size={16} /> {submitting ? 'Submitting…' : 'Submit change request'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Summary / preview panel */}
        <Card className="h-fit">
          <CardHeader title="Request preview" subtitle="Review before submitting" icon={GitPullRequest} />
          <div className="space-y-4 p-5 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-slateblue-400">Title</p>
              <p className="font-semibold text-plum">{form.title.trim() || 'Untitled change'}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="badge bg-plum-100 text-plum-700">{humanize(form.changeType)}</span>
              <StatusBadge value={form.riskLevel} map={RISK_BADGE} />
            </div>

            <PreviewRow icon={ClipboardList} label="Impact" value={form.impactAssessment.trim() || 'Not assessed yet'} />
            <PreviewRow icon={ShieldAlert} label="Rollback" value={form.rollbackPlan.trim() || 'No rollback plan provided'} />

            <div className="rounded-lg bg-mint px-3 py-3 text-xs text-slateblue-600">
              <p className="mb-1 flex items-center gap-1.5 font-medium text-plum">
                <CalendarClock size={14} /> Planned window
              </p>
              <p>Start: {form.plannedStartDate ? formatDateTime(form.plannedStartDate) : '—'}</p>
              <p>End: {form.plannedEndDate ? formatDateTime(form.plannedEndDate) : '—'}</p>
            </div>

            <p className="text-xs text-slateblue-400">
              The request is created in <span className="font-medium text-slateblue-600">DRAFT</span> status and enters the
              change workflow for CAB review.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PreviewRow({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-slateblue-400">
        <Icon size={13} /> {label}
      </p>
      <p className="mt-0.5 text-gray-700">{value}</p>
    </div>
  );
}
