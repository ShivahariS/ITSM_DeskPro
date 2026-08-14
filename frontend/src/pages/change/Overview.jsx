import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, CheckCircle2, CalendarDays, Rocket, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  PageHeader, StatCard, Card, CardHeader, Loading, ErrorState, Button,
} from '../../components/ui/index.jsx';
import { useAsync } from '../../lib/hooks.js';
import { humanize, RISK_LEVELS } from '../../lib/constants.js';
import { listChanges } from '../../api/changes.js';

// Palette-aligned hexes for the risk pie slices.
const RISK_FILL = {
  LOW: '#10b981', // emerald-500
  MEDIUM: '#f59e0b', // amber-500
  HIGH: '#ef4444', // red-500
  CRITICAL: '#991b1b', // red-800 (darkred)
};

export default function Overview() {
  const { data, loading, error, reload } = useAsync(listChanges);
  const changes = useMemo(() => data || [], [data]);

  const metrics = useMemo(() => {
    const count = (s) => changes.filter((c) => c.status === s).length;
    return {
      cabReview: count('CAB_REVIEW'),
      approved: count('APPROVED'),
      scheduled: count('SCHEDULED'),
      implemented: count('IMPLEMENTED'),
      total: changes.length,
    };
  }, [changes]);

  const riskData = useMemo(
    () =>
      RISK_LEVELS.map((level) => ({
        name: humanize(level),
        key: level,
        value: changes.filter((c) => c.riskLevel === level).length,
      })).filter((d) => d.value > 0),
    [changes]
  );

  if (loading) {
    return (
      <>
        <PageHeader title="Change Overview" subtitle="Change pipeline health at a glance" />
        <Loading />
      </>
    );
  }
  if (error) {
    return (
      <>
        <PageHeader title="Change Overview" subtitle="Change pipeline health at a glance" />
        <ErrorState message={error} onRetry={reload} />
      </>
    );
  }

  return (
    <div>
      <PageHeader
        title="Change Overview"
        subtitle="Change pipeline health at a glance"
        actions={
          <Link to="/change/queue">
            <Button size="sm">
              Go to queue <ArrowRight size={14} />
            </Button>
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending CAB Review"
          value={metrics.cabReview}
          icon={ClipboardCheck}
          tone={metrics.cabReview ? 'warn' : 'accent'}
          hint="Awaiting advisory board"
        />
        <StatCard
          label="Approved Changes"
          value={metrics.approved}
          icon={CheckCircle2}
          tone="success"
          hint="Ready to schedule"
        />
        <StatCard
          label="Scheduled Deployments"
          value={metrics.scheduled}
          icon={CalendarDays}
          tone="accent"
          hint="In the change window"
        />
        <StatCard
          label="Implemented"
          value={metrics.implemented}
          icon={Rocket}
          tone="accent"
          hint="Awaiting PIR / closure"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Risk Profile" subtitle="Change requests by risk level" />
          <div className="p-5">
            {riskData.length === 0 ? (
              <p className="py-10 text-center text-sm text-slateblue-400">No changes to chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={riskData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={2}
                    label={(d) => `${d.name}: ${d.value}`}
                  >
                    {riskData.map((entry) => (
                      <Cell key={entry.key} fill={RISK_FILL[entry.key] || '#321E48'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Pipeline Summary" subtitle="Distribution across the change lifecycle" />
          <div className="space-y-3 p-5">
            <SummaryRow label="Total changes" value={metrics.total} />
            <SummaryRow label="Pending CAB review" value={metrics.cabReview} />
            <SummaryRow label="Approved" value={metrics.approved} />
            <SummaryRow label="Scheduled" value={metrics.scheduled} />
            <SummaryRow label="Implemented" value={metrics.implemented} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-mint/50 px-4 py-3">
      <span className="text-sm text-slateblue-600">{label}</span>
      <span className="text-lg font-bold text-plum">{value}</span>
    </div>
  );
}
