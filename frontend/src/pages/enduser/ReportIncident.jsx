import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertTriangle, Clock, Send } from 'lucide-react';
import { PageHeader, Card, Field, Textarea, Select, Button } from '../../components/ui/index.jsx';
import { humanize, INCIDENT_CATEGORIES, PRIORITIES } from '../../lib/constants.js';
import { createIncident } from '../../api/incidents.js';

// Indicative SLA targets by priority (hours) — for the preview only.
const SLA_PREVIEW = { P1: 4, P2: 8, P3: 24, P4: 48 };
const PRIORITY_HINT = {
  P1: 'Critical — major outage / business-wide impact',
  P2: 'High — significant impact to a team or service',
  P3: 'Medium — single user impacted, workaround exists',
  P4: 'Low — minor issue or question',
};

export default function ReportIncident() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ category: '', description: '', priority: 'P3' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!form.category) er.category = 'Select a category.';
    if (!form.description.trim()) er.description = 'Describe the issue.';
    setErrors(er);
    if (Object.keys(er).length) return;

    setSubmitting(true);
    try {
      const created = await createIncident({
        category: form.category,
        description: form.description.trim(),
        priority: form.priority,
      });
      toast.success(`Incident #${created.incidentID} reported`);
      navigate('/enduser/my-tickets');
    } catch (err) {
      toast.error(err.friendlyMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Report an Incident" subtitle="Tell us what's not working and we'll get on it" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <form onSubmit={onSubmit} className="space-y-5">
            <Field label="Category" required error={errors.category}>
              <Select
                name="category"
                value={form.category}
                onChange={onChange}
                placeholder="Select a category…"
                options={INCIDENT_CATEGORIES.map((c) => ({ value: c, label: humanize(c) }))}
              />
            </Field>

            <Field label="Priority" required>
              <Select
                name="priority"
                value={form.priority}
                onChange={onChange}
                options={PRIORITIES.map((p) => ({ value: p, label: `${p} — ${PRIORITY_HINT[p]}` }))}
              />
            </Field>

            <Field label="Description" required error={errors.description} hint="Include what you were doing, any error messages, and when it started.">
              <Textarea
                name="description"
                rows={6}
                value={form.description}
                onChange={onChange}
                placeholder="Describe the issue in detail…"
              />
            </Field>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                <Send size={16} /> {submitting ? 'Submitting…' : 'Submit incident'}
              </Button>
            </div>
          </form>
        </Card>

        {/* SLA preview */}
        <Card className="h-fit p-6">
          <div className="mb-3 flex items-center gap-2 text-plum">
            <Clock size={18} className="text-cyanaccent-600" />
            <h3 className="text-base font-semibold">SLA Preview</h3>
          </div>
          <p className="text-sm text-slateblue-500">
            Based on the selected priority, your incident targets resolution within:
          </p>
          <p className="my-3 text-4xl font-extrabold text-plum">
            {SLA_PREVIEW[form.priority]}h
          </p>
          <div className="rounded-lg bg-mint px-3 py-2 text-xs text-slateblue-600">
            <AlertTriangle size={13} className="mr-1 inline text-amber-500" />
            {PRIORITY_HINT[form.priority]}
          </div>
          <ul className="mt-4 space-y-1.5 text-xs text-slateblue-500">
            {PRIORITIES.map((p) => (
              <li key={p} className="flex justify-between">
                <span className={p === form.priority ? 'font-semibold text-plum' : ''}>{p}</span>
                <span className={p === form.priority ? 'font-semibold text-plum' : ''}>{SLA_PREVIEW[p]} hours</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
