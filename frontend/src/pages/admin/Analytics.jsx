import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

// Lucide React Icons for KPI Cards and Headers
import {
  Ticket, ShieldCheck, Timer, PhoneCall, GitPullRequest, Users, BarChart3, FileText,
} from 'lucide-react';

// Recharts library components for renderable Pie and Bar Charts
import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts';

// UI Layout & Form Components from design system
import {
  PageHeader, StatCard, Card, CardHeader, Loading, ErrorState, Button, Field, Select, Badge,
} from '../../components/ui/index.jsx';

// Custom Utility Hooks & Formatting Functions
import { useAsync } from '../../lib/hooks.js';
import { formatDateTime, initials } from '../../lib/format.js';
import { humanize, REPORT_SCOPES, INCIDENT_STATUSES, PRIORITIES } from '../../lib/constants.js';

// API Services to fetch system data and trigger report generation
import { listIncidents } from '../../api/incidents.js';
import { listChanges } from '../../api/changes.js';
import { listUsers } from '../../api/users.js';
import { generateReport, listReports } from '../../api/reports.js';

// Color palette mapping for Incident Statuses in Pie Chart
const STATUS_FILL = {
  OPEN: '#d97706',
  IN_PROGRESS: '#43637E',
  PENDING: '#94a3b8',
  RESOLVED: '#059669',
  CLOSED: '#65DCD5',
  REOPENED: '#dc2626',
};

// Color palette mapping for Incident Priorities in Bar Chart
const PRIORITY_FILL = {
  P1: '#dc2626',
  P2: '#d97706',
  P3: '#43637E',
  P4: '#65DCD5',
};

// Defined statuses considered "Resolved" for SLA and MTTR calculations
const RESOLVED_STATUSES = ['RESOLVED', 'CLOSED'];

// Predefined Options to populate dropdowns and avoid invalid free-text inputs
const VALID_CATEGORIES = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCESS', 'OTHER'];
const VALID_PRIORITIES = ['P1', 'P2', 'P3', 'P4'];
const VALID_TEAMS = [
  { value: '1', label: 'Team 1 - Service Desk' },
  { value: '2', label: 'Team 2 - Infrastructure' },
  { value: '3', label: 'Team 3 - Application Support' },
  { value: '4', label: 'Team 4 - Security Operations' },
];
const VALID_PERIODS = [
  { value: '2026-07', label: 'July 2026' },
  { value: '2026-06', label: 'June 2026' },
  { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
  { value: 'LAST_90_DAYS', label: 'Last 90 Days' },
  { value: 'YTD', label: 'Year to Date (2026)' },
];

/**
 * Helper function to calculate duration in hours between two timestamps.
 * Returns null if start/end dates are missing or invalid.
 */
function hoursBetween(start, end) {
  const s = start ? new Date(start).getTime() : NaN;
  const e = end ? new Date(end).getTime() : NaN;
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return null;
  return (e - s) / 3_600_000;
}

export default function Analytics() {
  // Asynchronously fetch data dependencies from backend
  const incidentsQ = useAsync(listIncidents);
  const changesQ = useAsync(listChanges);
  const usersQ = useAsync(listUsers);
  const reportsQ = useAsync(listReports);

  // Form State Management for Report Generation
  const [scope, setScope] = useState(REPORT_SCOPES?.[0] || 'PERIOD'); // Active scope filter type (e.g., TEAM, PERIOD)
  const [scopeValue, setScopeValue] = useState('');                   // Selected scope value (e.g., '1', '2026-07')
  const [generating, setGenerating] = useState(false);               // Loading state during API submit

  // Memoized extracts of query data (prevents unnecessary re-renders)
  const incidents = useMemo(() => incidentsQ.data || [], [incidentsQ.data]);
  const changes = useMemo(() => changesQ.data || [], [changesQ.data]);
  const users = useMemo(() => usersQ.data || [], [usersQ.data]);
  const reports = useMemo(() => reportsQ.data || [], [reportsQ.data]);

  // Real-time calculation of key ITSM performance metrics (KPIs)
  const metrics = useMemo(() => {
    const total = incidents.length;
    const resolved = incidents.filter((i) => RESOLVED_STATUSES.includes(i.status) || i.resolutionDate);
    const resolvedCount = resolved.length;

    // 1. SLA Compliance Calculation (% resolved on or before SLA due date)
    const withinSla = resolved.filter((i) => {
      if (!i.resolutionDate || !i.slaDueDate) return false;
      return new Date(i.resolutionDate).getTime() <= new Date(i.slaDueDate).getTime();
    }).length;
    const slaCompliance = resolvedCount ? Math.round((withinSla / resolvedCount) * 100) : 0;

    // 2. Average Mean Time To Resolve (MTTR in hours)
    const mttrValues = resolved
      .map((i) => hoursBetween(i.loggedDate, i.resolutionDate))
      .filter((h) => h != null);
    const avgMttr = mttrValues.length
      ? mttrValues.reduce((a, b) => a + b, 0) / mttrValues.length
      : null;

    // 3. First Call Resolution Rate (% resolved without being reopened)
    const fcrCount = incidents.filter(
      (i) => RESOLVED_STATUSES.includes(i.status) && i.status !== 'REOPENED'
    ).length;
    const fcr = total ? Math.round((fcrCount / total) * 100) : 0;

    // 4. Change Request Success Rate (% of implemented changes)
    const totalChanges = changes.length;
    const implemented = changes.filter((c) => c.status === 'IMPLEMENTED').length;
    const changeSuccess = totalChanges ? Math.round((implemented / totalChanges) * 100) : 0;

    return {
      total,
      resolvedCount,
      slaCompliance,
      avgMttr,
      fcr,
      changeSuccess,
      totalChanges,
      implemented,
      totalUsers: users.length,
    };
  }, [incidents, changes, users]);

  // Format data specifically for the Incidents by Status Pie Chart
  const byStatus = useMemo(
    () =>
      (INCIDENT_STATUSES || []).map((s) => ({
        name: humanize(s),
        key: s,
        value: incidents.filter((i) => i.status === s).length,
      })).filter((d) => d.value > 0),
    [incidents]
  );

  // Format data specifically for the Incidents by Priority Bar Chart
  const byPriority = useMemo(
    () =>
      (PRIORITIES || []).map((p) => ({
        priority: p,
        count: incidents.filter((i) => i.priority === p).length,
      })),
    [incidents]
  );

  // Extract and sort the single most recently generated report
  const latestReport = useMemo(() => {
    if (!reports.length) return null;
    return [...reports].sort((a, b) => {
      const da = new Date(a.generatedDate || 0).getTime();
      const db = new Date(b.generatedDate || 0).getTime();
      if (db !== da) return db - da; // Primary sort: Newest date first
      return (b.reportID || 0) - (a.reportID || 0); // Secondary sort: Highest Report ID first
    })[0];
  }, [reports]);

  // Handler: Validate inputs and trigger report generation API
  const handleGenerate = async () => {
    const trimmedValue = scopeValue.trim();

    // Prevent submission without selecting a value
    if (!trimmedValue) {
      toast.error('Please select a valid Scope Value');
      return;
    }

    setGenerating(true);
    try {
      await generateReport(scope, trimmedValue);
      toast.success('Report generated successfully');
      setScopeValue(''); // Reset value input
      reportsQ.reload(); // Refresh historical reports log
    } catch (e) {
      toast.error(e?.friendlyMessage || e?.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  // Combine loading and error states across all data queries
  const loading = incidentsQ.loading || changesQ.loading || usersQ.loading;
  const error = incidentsQ.error || changesQ.error || usersQ.error;

  // Master reload function to refresh all dashboard queries
  const reload = () => {
    incidentsQ.reload();
    changesQ.reload();
    usersQ.reload();
    reportsQ.reload();
  };

  // Display Full Page Spinner while loading initial data
  if (loading) {
    return (
      <>
        <PageHeader title="Global ITSM Analytics" subtitle="Executive view of service management performance" />
        <Loading />
      </>
    );
  }

  // Display Error State component if any primary fetch failed
  if (error) {
    return (
      <>
        <PageHeader title="Global ITSM Analytics" subtitle="Executive view of service management performance" />
        <ErrorState message={error} onRetry={reload} />
      </>
    );
  }

  // Formatting helpers for percentages and hour units
  const fmtPct = (v) => (v == null ? '—' : `${Math.round(v)}%`);
  const fmtHours = (v) => (v == null ? '—' : `${v.toFixed(1)}h`);

  return (
    <div className="space-y-6">
      {/* Dashboard Page Header */}
      <PageHeader title="Global ITSM Analytics" subtitle="Executive view of service management performance" />

      {/* Top Section: Executive KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Ticket Volume" value={metrics.total} icon={Ticket} hint="Total incidents logged" />
        <StatCard
          label="Global SLA Compliance"
          value={`${metrics.slaCompliance}%`}
          icon={ShieldCheck}
          tone={metrics.slaCompliance >= 90 ? 'success' : metrics.slaCompliance >= 75 ? 'warn' : 'danger'}
          hint={`${metrics.resolvedCount} resolved incidents`}
        />
        <StatCard
          label="Average MTTR"
          value={metrics.avgMttr == null ? '—' : `${metrics.avgMttr.toFixed(1)}h`}
          icon={Timer}
          hint="Mean time to resolve"
        />
        <StatCard
          label="First Call Resolution"
          value={`${metrics.fcr}%`}
          icon={PhoneCall}
          tone={metrics.fcr >= 70 ? 'success' : 'warn'}
          hint="Resolved without reopen"
        />
        <StatCard
          label="Change Success Rate"
          value={`${metrics.changeSuccess}%`}
          icon={GitPullRequest}
          tone={metrics.changeSuccess >= 90 ? 'success' : metrics.changeSuccess >= 75 ? 'warn' : 'danger'}
          hint={`${metrics.implemented} of ${metrics.totalChanges} implemented`}
        />
        <StatCard label="Total Users" value={metrics.totalUsers} icon={Users} hint="Registered accounts" />
      </div>

      {/* Middle Section: Visual Recharts Data Visualizations */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Incident Status Breakdown Pie Chart */}
        <Card>
          <CardHeader title="Incidents by Status" subtitle="Lifecycle distribution" icon={BarChart3} />
          <div className="p-5">
            {byStatus.length === 0 ? (
              <p className="py-10 text-center text-sm text-slateblue-400">No incidents to chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2}>
                    {byStatus.map((entry) => (
                      <Cell key={entry.key} fill={STATUS_FILL[entry.key] || '#321E48'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Incident Severity Breakdown Bar Chart */}
        <Card>
          <CardHeader title="Incidents by Priority" subtitle="Severity breakdown" icon={BarChart3} />
          <div className="p-5">
            {metrics.total === 0 ? (
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
      </div>

      {/* Bottom Section: Scoped Report Snapshot Generator */}
      <Card>
        <CardHeader title="Report Generator" subtitle="Generate a scoped ITSM report snapshot" icon={FileText} />
        <div className="grid gap-5 p-5 lg:grid-cols-2">
          {/* Controls Form Side */}
          <div className="space-y-4">
            {/* Scope Type Selection Dropdown */}
            <Field label="Report scope" required>
              <Select
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value);
                  setScopeValue(''); // Automatically clear scope value when switching scope type
                }}
                options={(REPORT_SCOPES || []).map((s) => ({ value: s, label: humanize(s) }))}
              />
            </Field>

            {/* Dynamic Scope Value Dropdown (options change based on chosen Scope) */}
            <Field label="Scope value" required hint={`Select valid ${humanize(scope)} option`}>
              {scope === 'TEAM' ? (
                <Select
                  value={scopeValue}
                  onChange={(e) => setScopeValue(e.target.value)}
                  options={[{ value: '', label: 'Select Team...' }, ...VALID_TEAMS]}
                />
              ) : scope === 'PERIOD' ? (
                <Select
                  value={scopeValue}
                  onChange={(e) => setScopeValue(e.target.value)}
                  options={[{ value: '', label: 'Select Period...' }, ...VALID_PERIODS]}
                />
              ) : scope === 'PRIORITY' ? (
                <Select
                  value={scopeValue}
                  onChange={(e) => setScopeValue(e.target.value)}
                  options={[
                    { value: '', label: 'Select Priority...' },
                    ...VALID_PRIORITIES.map((p) => ({ value: p, label: p }))
                  ]}
                />
              ) : scope === 'CATEGORY' ? (
                <Select
                  value={scopeValue}
                  onChange={(e) => setScopeValue(e.target.value)}
                  options={[
                    { value: '', label: 'Select Category...' },
                    ...VALID_CATEGORIES.map((c) => ({ value: c, label: humanize(c) }))
                  ]}
                />
              ) : null}
            </Field>

            {/* Generate Report Submit Button */}
            <Button onClick={handleGenerate} disabled={generating || !scopeValue}>
              <FileText size={16} /> {generating ? 'Generating…' : 'Generate report'}
            </Button>
          </div>

          {/* Latest Generated Report Metrics Summary Side */}
          <div className="rounded-lg border border-slateblue-100 bg-mint/40 p-4">
            {reportsQ.loading ? (
              <p className="text-sm text-slateblue-500">Loading reports…</p>
            ) : !latestReport ? (
              <p className="text-sm text-slateblue-500">No reports generated yet.</p>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-plum">Latest report #{latestReport.reportID}</span>
                  <Badge className="bg-slateblue-100 text-slateblue-700">{humanize(latestReport.scope)}</Badge>
                </div>
                <p className="text-xs text-slateblue-400">
                  Generated {formatDateTime(latestReport.generatedDate)}
                  {latestReport.scopeValue ? ` · scope value: ${latestReport.scopeValue}` : ''}
                </p>

                {/* Key Metrics Grid for Last Generated Snapshot */}
                <dl className="grid grid-cols-2 gap-3">
                  <ReportMetric label="Ticket count" value={latestReport.ticketCount ?? '—'} />
                  <ReportMetric label="SLA compliance" value={fmtPct(latestReport.slaComplianceRate)} />
                  <ReportMetric label="MTTR" value={fmtHours(latestReport.mttr)} />
                  <ReportMetric label="First call resolution" value={fmtPct(latestReport.firstCallResolutionRate)} />
                  <ReportMetric label="Change success" value={fmtPct(latestReport.changeSuccessRate)} />
                  <ReportMetric label="Problem recurrence" value={fmtPct(latestReport.problemRecurrenceRate)} />
                  <ReportMetric label="License compliance" value={fmtPct(latestReport.licenseCompliancePercent)} />
                </dl>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Reports Audit History Log Table */}
      {reports.length > 0 && (
        <Card>
          <CardHeader title="Reports Audit Log" subtitle="Historical record of generated snapshots" icon={FileText} />
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b">
                <tr>
                  <th className="p-3">Report ID</th>
                  <th className="p-3">Scope</th>
                  <th className="p-3">Scope Value</th>
                  <th className="p-3">Ticket Count</th>
                  <th className="p-3">SLA Compliance</th>
                  <th className="p-3">MTTR</th>
                  <th className="p-3">Generated Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <tr key={r.reportID} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slateblue-700">#RPT-{r.reportID}</td>
                    <td className="p-3">
                      <Badge className="bg-slate-100 text-slate-700">{humanize(r.scope)}</Badge>
                    </td>
                    <td className="p-3 text-slate-600">{r.scopeValue || '—'}</td>
                    <td className="p-3 font-medium text-slate-800">{r.ticketCount ?? 0}</td>
                    <td className="p-3 font-semibold text-emerald-600">{fmtPct(r.slaComplianceRate)}</td>
                    <td className="p-3 text-slate-600">{fmtHours(r.mttr)}</td>
                    <td className="p-3 text-xs text-slate-400">{formatDateTime(r.generatedDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * Reusable Metric display box component for the generated report summary widget.
 */
function ReportMetric({ label, value }) {
  return (
    <div className="rounded-md bg-white px-3 py-2 border border-slate-100 shadow-xs">
      <dt className="text-xs text-slateblue-500">{label}</dt>
      <dd className="text-base font-bold text-plum">{value}</dd>
    </div>
  );
}