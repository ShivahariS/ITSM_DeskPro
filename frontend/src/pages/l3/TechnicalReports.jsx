import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { LineChart as LineChartIcon, Sparkles, FileBarChart, Clock, Gauge } from 'lucide-react';
import {
  PageHeader, Card, CardHeader, Field, Input, Select, Button, Loading, EmptyState, ErrorState,
} from '../../components/ui/index.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDateTime } from '../../lib/format.js';
import { humanize, REPORT_SCOPES } from '../../lib/constants.js';
import { generateReport, listReports } from '../../api/reports.js';

const PLUM = '#321E48';
const SLATEBLUE = '#43637E';
const CYAN = '#65DCD5';

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

const fmtRate = (v) => (v == null ? '—' : `${Number(v).toFixed(1)}%`);
const fmtMttr = (v) => (v == null ? '—' : `${Number(v).toFixed(1)}h`);

export default function TechnicalReports() {
  const { data, loading, error, reload } = useAsync(listReports);
  const [scope, setScope] = useState('TEAM');
  const [scopeValue, setScopeValue] = useState('');
  const [busy, setBusy] = useState(false);

  const reports = useMemo(
    () => [...(data || [])].sort((a, b) => (a.reportID ?? 0) - (b.reportID ?? 0)),
    [data]
  );
  const latest = reports.length ? reports[reports.length - 1] : null;

  const mttrTrend = useMemo(
    () =>
      reports.map((r) => ({
        name: `#${r.reportID}`,
        mttr: r.mttr == null ? null : Number(Number(r.mttr).toFixed(1)),
        sla: r.slaComplianceRate == null ? null : Number(Number(r.slaComplianceRate).toFixed(1)),
      })),
    [reports]
  );

  const latestRates = useMemo(() => {
    if (!latest) return [];
    return [
      { name: 'SLA', value: numOrZero(latest.slaComplianceRate) },
      { name: 'FCR', value: numOrZero(latest.firstCallResolutionRate) },
      { name: 'Change', value: numOrZero(latest.changeSuccessRate) },
      { name: 'Prob. recur.', value: numOrZero(latest.problemRecurrenceRate) },
      { name: 'License', value: numOrZero(latest.licenseCompliancePercent) },
    ];
  }, [latest]);

  const generate = async () => {
    const trimmedValue = scopeValue.trim();
    if (!trimmedValue) {
      toast.error('Please select a valid Scope Value');
      return;
    }
    setBusy(true);
    try {
      const r = await generateReport(scope, trimmedValue);
      toast.success(`Report #${r.reportID} generated`);
      setScopeValue('');
      reload();
    } catch (e) {
      toast.error(e.friendlyMessage || 'Failed to generate report');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Technical Reports"
        subtitle="Generate and review ITSM performance analytics"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Generator */}
        <Card className="h-fit">
          <CardHeader title="Generate report" subtitle="Pick a scope to compute metrics" icon={Sparkles} />
          <div className="space-y-4 p-5">
            <Field label="Scope" required>
              <Select
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value);
                  setScopeValue('');
                }}
                options={REPORT_SCOPES.map((s) => ({ value: s, label: humanize(s) }))}
              />
            </Field>
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
            <Button className="w-full justify-center" onClick={generate} disabled={busy || !scopeValue}>
              <FileBarChart size={16} /> {busy ? 'Generating…' : 'Generate report'}
            </Button>
          </div>
        </Card>



        {/* Latest snapshot */}
        <Card className="h-fit lg:col-span-2">
          <CardHeader title="Latest report" subtitle={latest ? `${humanize(latest.scope)}${latest.scopeValue ? ` · ${latest.scopeValue}` : ''} · ${formatDateTime(latest.generatedDate)}` : 'No reports yet'} icon={Gauge} />
          <div className="p-5">
            {loading ? (
              <Loading label="Loading reports…" />
            ) : !latest ? (
              <EmptyState icon={FileBarChart} title="No reports yet" message="Generate a report to see key performance metrics." />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Metric label="Tickets" value={latest.ticketCount ?? '—'} />
                <Metric label="SLA compliance" value={fmtRate(latest.slaComplianceRate)} />
                <Metric label="MTTR" value={fmtMttr(latest.mttr)} icon={Clock} />
                <Metric label="First-call resolution" value={fmtRate(latest.firstCallResolutionRate)} />
                <Metric label="Change success" value={fmtRate(latest.changeSuccessRate)} />
                <Metric label="Problem recurrence" value={fmtRate(latest.problemRecurrenceRate)} />
                <Metric label="License compliance" value={fmtRate(latest.licenseCompliancePercent)} />
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Charts */}
      {!loading && !error && reports.length > 0 && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="MTTR & SLA trend" subtitle="Across generated reports" icon={LineChartIcon} />
            <div className="h-72 p-5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mttrTrend} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: SLATEBLUE }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: SLATEBLUE }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: SLATEBLUE }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line yAxisId="left" type="monotone" dataKey="mttr" name="MTTR (h)" stroke={PLUM} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  <Line yAxisId="right" type="monotone" dataKey="sla" name="SLA (%)" stroke={CYAN} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader title="Latest report — key rates" subtitle={latest ? `Report #${latest.reportID}` : ''} icon={Gauge} />
            <div className="h-72 p-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={latestRates} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: SLATEBLUE }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: SLATEBLUE }} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="value" name="Rate (%)" fill={CYAN} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Report history table */}
      <Card className="mt-6 overflow-hidden">
        <CardHeader title="Report history" subtitle="All generated reports" icon={FileBarChart} />
        {loading ? (
          <Loading label="Loading reports…" />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : reports.length === 0 ? (
          <EmptyState icon={FileBarChart} title="No reports yet" message="Generated reports will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Scope</th>
                  <th>Tickets</th>
                  <th>SLA</th>
                  <th>MTTR</th>
                  <th>FCR</th>
                  <th>Change</th>
                  <th>Prob. recur.</th>
                  <th>License</th>
                  <th>Generated</th>
                </tr>
              </thead>
              <tbody>
                {[...reports].reverse().map((r) => (
                  <tr key={r.reportID}>
                    <td className="font-semibold text-plum">#{r.reportID}</td>
                    <td>{humanize(r.scope)}{r.scopeValue ? ` · ${r.scopeValue}` : ''}</td>
                    <td>{r.ticketCount ?? '—'}</td>
                    <td>{fmtRate(r.slaComplianceRate)}</td>
                    <td>{fmtMttr(r.mttr)}</td>
                    <td>{fmtRate(r.firstCallResolutionRate)}</td>
                    <td>{fmtRate(r.changeSuccessRate)}</td>
                    <td>{fmtRate(r.problemRecurrenceRate)}</td>
                    <td>{fmtRate(r.licenseCompliancePercent)}</td>
                    <td className="text-xs text-slateblue-500">{formatDateTime(r.generatedDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function numOrZero(v) {
  return v == null ? 0 : Number(Number(v).toFixed(1));
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slateblue-100 p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-slateblue-500">
        {Icon && <Icon size={13} className="text-cyanaccent-600" />} {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-plum">{value}</p>
    </div>
  );
}