import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Activity, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts';
import {
  PageHeader, StatCard, Card, CardHeader, Loading, ErrorState, Button,
} from '../../components/ui/index.jsx';
import { useAsync } from '../../lib/hooks.js';
import { slaCountdown } from '../../lib/format.js';
import { humanize, PRIORITIES, INCIDENT_STATUSES } from '../../lib/constants.js';
import { listIncidents } from '../../api/incidents.js';

const OPEN_STATUSES = ['OPEN', 'IN_PROGRESS', 'PENDING', 'REOPENED'];
const CLOSED_STATUSES = ['RESOLVED', 'CLOSED'];

// Palette hexes for the recharts fills (per priority).
const PRIORITY_FILL = {
  P1: '#dc2626', // red-600
  P2: '#d97706', // amber-600
  P3: '#43637E', // slateblue
  P4: '#65DCD5', // cyanaccent
};

// Heatmap cell tint scaled by relative count.
function heatClass(count, max) {
  if (!count) return 'bg-slateblue-50 text-slateblue-300';
  const ratio = max ? count / max : 0;
  if (ratio > 0.66) return 'bg-cyanaccent-500 text-plum font-semibold';
  if (ratio > 0.33) return 'bg-cyanaccent-300 text-plum font-semibold';
  return 'bg-mint text-slateblue-700';
}

export default function Overview() {
  const { data, loading, error, reload } = useAsync(listIncidents);
  const incidents = useMemo(() => data || [], [data]);

  const metrics = useMemo(() => {
    const total = incidents.length;
    const unassigned = incidents.filter((i) => i.assignedToID == null).length;
    const open = incidents.filter((i) => OPEN_STATUSES.includes(i.status)).length;
    const resolvedClosed = incidents.filter((i) => CLOSED_STATUSES.includes(i.status)).length;
    const breachRisk = incidents.filter((i) => {
      if (CLOSED_STATUSES.includes(i.status)) return false;
      const tone = slaCountdown(i.slaDueDate).tone;
      return tone === 'breached' || tone === 'risk';
    }).length;
    const fcr = total ? Math.round((resolvedClosed / total) * 100) : 0;
    return { total, unassigned, open, breachRisk, fcr };
  }, [incidents]);

  const byPriority = useMemo(
    () =>
      PRIORITIES.map((p) => ({
        priority: p,
        count: incidents.filter((i) => i.priority === p).length,
      })),
    [incidents]
  );

  const heatmap = useMemo(() => {
    const grid = {};
    let max = 0;
    PRIORITIES.forEach((p) => {
      grid[p] = {};
      INCIDENT_STATUSES.forEach((s) => {
        const c = incidents.filter((i) => i.priority === p && i.status === s).length;
        grid[p][s] = c;
        if (c > max) max = c;
      });
    });
    return { grid, max };
  }, [incidents]);

  if (loading) return <><PageHeader title="Support Overview" subtitle="Service desk health at a glance" /><Loading /></>;
  if (error) {
    return (
      <>
        <PageHeader title="Support Overview" subtitle="Service desk health at a glance" />
        <ErrorState message={error} onRetry={reload} />
      </>
    );
  }

  return (
    <div>
      <PageHeader
        title="Support Overview"
        subtitle="Service desk health at a glance"
        actions={
          <Link to="/l1/incident-queue">
            <Button size="sm">
              Go to queue <ArrowRight size={14} />
            </Button>
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Unassigned Incidents" value={metrics.unassigned} icon={Inbox} tone={metrics.unassigned ? 'warn' : 'accent'} hint="Awaiting triage" />
        <StatCard label="Open Incidents" value={metrics.open} icon={Activity} tone="accent" hint="Active workload" />
        <StatCard label="SLA Breach Risk" value={metrics.breachRisk} icon={AlertTriangle} tone={metrics.breachRisk ? 'danger' : 'success'} hint="Breached or due soon" />
        <StatCard label="First Call Resolution" value={`${metrics.fcr}%`} icon={CheckCircle2} tone="success" hint={`${metrics.total} incidents total`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Incidents by priority */}
        <Card>
          <CardHeader title="Incidents by Priority" subtitle="Distribution across severity levels" />
          <div className="p-5">
            {metrics.total === 0 ? (
              <p className="py-10 text-center text-sm text-slateblue-400">No incidents to chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={byPriority} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="priority" tick={{ fill: '#43637E', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#43637E', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#D9FFF4' }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Incidents">
                    {byPriority.map((entry) => (
                      <Cell key={entry.priority} fill={PRIORITY_FILL[entry.priority] || '#321E48'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Queue heatmap */}
        <Card>
          <CardHeader title="Queue Heatmap" subtitle="Incident counts by priority and status" />
          <div className="overflow-x-auto p-5">
            <table className="w-full border-separate border-spacing-1 text-center text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left font-semibold text-slateblue-500">Priority</th>
                  {INCIDENT_STATUSES.map((s) => (
                    <th key={s} className="px-1 py-1 font-medium text-slateblue-500">{humanize(s)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRIORITIES.map((p) => (
                  <tr key={p}>
                    <td className="px-2 py-1 text-left font-semibold text-plum">{p}</td>
                    {INCIDENT_STATUSES.map((s) => {
                      const c = heatmap.grid[p][s];
                      return (
                        <td key={s} className={`rounded-md px-2 py-2 ${heatClass(c, heatmap.max)}`}>
                          {c}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
