import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldAlert, Timer, ArrowRight, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  PieChart, Pie, Legend,
} from 'recharts';
import {
  PageHeader, StatCard, Card, CardHeader, Loading, ErrorState, Button,
} from '../../components/ui/index.jsx';
import { useAsync } from '../../lib/hooks.js';
import { humanize, PRIORITIES, PROBLEM_STATUSES } from '../../lib/constants.js';
import { listIncidents } from '../../api/incidents.js';
import { listProblems } from '../../api/problems.js';

// Active problem states L2 owns.
const ACTIVE_PROBLEM_STATUSES = ['OPEN', 'UNDER_INVESTIGATION', 'KNOWN_ERROR'];

// Palette hexes for chart fills.
const PRIORITY_FILL = {
  P1: '#dc2626', // red-600
  P2: '#d97706', // amber-600
  P3: '#43637E', // slateblue
  P4: '#65DCD5', // cyanaccent
};
const PROBLEM_FILL = {
  OPEN: '#d97706',
  UNDER_INVESTIGATION: '#43637E',
  KNOWN_ERROR: '#321E48',
  RESOLVED: '#059669',
  CLOSED: '#94a3b8',
};

export default function Hub() {
  const incidentsQ = useAsync(listIncidents);
  const problemsQ = useAsync(listProblems);

  const loading = incidentsQ.loading || problemsQ.loading;
  const error = incidentsQ.error || problemsQ.error;
  const reload = () => { incidentsQ.reload(); problemsQ.reload(); };

  const incidents = useMemo(() => incidentsQ.data || [], [incidentsQ.data]);
  const problems = useMemo(() => problemsQ.data || [], [problemsQ.data]);

  const metrics = useMemo(() => {
    // Escalated / active incidents needing L2 attention.
    const escalated = incidents.filter(
      (i) => (i.priority === 'P1' || i.priority === 'P2' || i.status === 'IN_PROGRESS')
        && !['RESOLVED', 'CLOSED'].includes(i.status)
    ).length;

    const activeProblems = problems.filter((p) => ACTIVE_PROBLEM_STATUSES.includes(p.status)).length;

    // Mean time to resolve — avg hours between loggedDate and resolutionDate.
    const resolved = incidents.filter((i) => i.loggedDate && i.resolutionDate);
    let mttr = 'N/A';
    if (resolved.length) {
      const totalHours = resolved.reduce((sum, i) => {
        const start = new Date(i.loggedDate).getTime();
        const end = new Date(i.resolutionDate).getTime();
        return sum + Math.max(0, end - start) / 36e5;
      }, 0);
      mttr = `${(totalHours / resolved.length).toFixed(1)}h`;
    }
    return { escalated, activeProblems, mttr, resolvedCount: resolved.length };
  }, [incidents, problems]);

  const byPriority = useMemo(
    () => PRIORITIES.map((p) => ({
      priority: p,
      count: incidents.filter((i) => i.priority === p).length,
    })),
    [incidents]
  );

  const problemsByStatus = useMemo(
    () => PROBLEM_STATUSES
      .map((s) => ({ name: humanize(s), status: s, value: problems.filter((p) => p.status === s).length }))
      .filter((d) => d.value > 0),
    [problems]
  );

  if (loading) {
    return (
      <>
        <PageHeader title="L2 Operations Hub" subtitle="Escalation, problem and configuration health" />
        <Loading />
      </>
    );
  }
  if (error) {
    return (
      <>
        <PageHeader title="L2 Operations Hub" subtitle="Escalation, problem and configuration health" />
        <ErrorState message={error} onRetry={reload} />
      </>
    );
  }

  return (
    <div>
      <PageHeader
        title="L2 Operations Hub"
        subtitle="Escalation, problem and configuration health"
        actions={
          <Link to="/l2/escalated-queue">
            <Button size="sm">
              Escalated queue <ArrowRight size={14} />
            </Button>
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Escalated / Active Incidents"
          value={metrics.escalated}
          icon={Layers}
          tone={metrics.escalated ? 'warn' : 'accent'}
          hint="P1/P2 or in-progress, not yet resolved"
        />
        <StatCard
          label="Active Problem Records"
          value={metrics.activeProblems}
          icon={ShieldAlert}
          tone={metrics.activeProblems ? 'accent' : 'success'}
          hint="Open, under investigation or known error"
        />
        <StatCard
          label="Average MTTR"
          value={metrics.mttr}
          icon={Timer}
          tone="success"
          hint={metrics.resolvedCount ? `${metrics.resolvedCount} resolved incidents` : 'No resolved incidents yet'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Incidents by priority */}
        <Card>
          <CardHeader title="Incidents by Priority" subtitle="Severity distribution across the estate" icon={Activity} />
          <div className="p-5">
            {incidents.length === 0 ? (
              <p className="py-10 text-center text-sm text-slateblue-400">No incidents to chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byPriority} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="priority" tick={{ fill: '#43637E', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#43637E', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#D9FFF4' }} contentStyle={{ borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }} />
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

        {/* Problems by status */}
        <Card>
          <CardHeader title="Problem Records by Status" subtitle="Problem lifecycle at a glance" icon={ShieldAlert} />
          <div className="p-5">
            {problemsByStatus.length === 0 ? (
              <p className="py-10 text-center text-sm text-slateblue-400">No problem records to chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={problemsByStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                  >
                    {problemsByStatus.map((entry) => (
                      <Cell key={entry.status} fill={PROBLEM_FILL[entry.status] || '#321E48'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
