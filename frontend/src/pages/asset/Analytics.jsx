import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, KeyRound, Gauge, AlertTriangle, ArrowRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  PieChart, Pie, Legend,
} from 'recharts';
import {
  PageHeader, StatCard, Card, CardHeader, Loading, ErrorState, Button, ProgressBar,
} from '../../components/ui/index.jsx';
import { useAsync } from '../../lib/hooks.js';
import { pct } from '../../lib/format.js';
import { humanize, ASSET_TYPES, ASSET_STATUSES } from '../../lib/constants.js';
import { listAssets, listLicenses, listExpiringWarranty } from '../../api/assets.js';

// Palette-aligned fills for charts.
const TYPE_FILL = {
  LAPTOP: '#321E48', // plum
  SERVER: '#43637E', // slateblue
  NETWORK_DEVICE: '#65DCD5', // cyanaccent
  PRINTER: '#8b7ba6', // plum tint
  MOBILE_DEVICE: '#9fb3c8', // slateblue tint
};
const STATUS_FILL = {
  IN_USE: '#10b981', // emerald
  IN_STOCK: '#0ea5e9', // sky
  UNDER_REPAIR: '#d97706', // amber
  RETIRED: '#94a3b8', // slate
  DISPOSED: '#dc2626', // red
};

export default function Analytics() {
  const assetsQ = useAsync(listAssets);
  const licensesQ = useAsync(listLicenses);
  const warrantyQ = useAsync(listExpiringWarranty);

  const assets = useMemo(() => assetsQ.data || [], [assetsQ.data]);
  const licenses = useMemo(() => licensesQ.data || [], [licensesQ.data]);

  const metrics = useMemo(() => {
    const totalHardware = assets.length;
    const activeLicenses = licenses.filter((l) => l.status === 'ACTIVE').length;
    const expiringWarranties = (warrantyQ.data || []).length;
    return { totalHardware, activeLicenses, expiringWarranties };
  }, [assets, licenses, warrantyQ.data]);

  const byType = useMemo(
    () =>
      ASSET_TYPES.map((t) => ({
        type: t,
        label: humanize(t),
        count: assets.filter((a) => a.assetType === t).length,
      })),
    [assets]
  );

  const byStatus = useMemo(
    () =>
      ASSET_STATUSES.map((s) => ({
        status: s,
        name: humanize(s),
        value: assets.filter((a) => a.status === s).length,
      })).filter((d) => d.value > 0),
    [assets]
  );

  const loading = assetsQ.loading || licensesQ.loading || warrantyQ.loading;
  const error = assetsQ.error || licensesQ.error || warrantyQ.error;

  const reloadAll = () => {
    assetsQ.reload();
    licensesQ.reload();
    warrantyQ.reload();
  };

  if (loading) {
    return (
<>
<PageHeader title="Asset Analytics" subtitle="Hardware, licensing and lifecycle at a glance" />
<Loading />
</>
    );
  }
  if (error) {
    return (
<>
<PageHeader title="Asset Analytics" subtitle="Hardware, licensing and lifecycle at a glance" />
<ErrorState message={error} onRetry={reloadAll} />
</>
    );
  }

  return (
<div>
<PageHeader
        title="Asset Analytics"
        subtitle="Hardware, licensing and lifecycle at a glance"
        actions={
<Link to="/asset/hardware">
<Button size="sm">
              Manage inventory <ArrowRight size={14} />
</Button>
</Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
<StatCard label="Total Hardware Assets" value={metrics.totalHardware} tone="accent" hint="Across all types" />
<StatCard label="Active Software Licenses" value={metrics.activeLicenses} tone="success" hint={`${licenses.length} licenses total`} />
<StatCard label="Expiring Warranties" value={metrics.expiringWarranties} tone={metrics.expiringWarranties ? 'warn' : 'success'} hint="Within 30 days" />
</div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assets by type */}
<Card>
<CardHeader title="Assets by Type" subtitle="Hardware inventory breakdown" />
<div className="p-5">
            {metrics.totalHardware === 0 ? (
<p className="py-10 text-center text-sm text-slateblue-400">No assets to chart.</p>
            ) : (
<ResponsiveContainer width="100%" height={260}>
<BarChart data={byType} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
<XAxis dataKey="label" tick={{ fill: '#43637E', fontSize: 11 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} interval={0} />
<YAxis allowDecimals={false} tick={{ fill: '#43637E', fontSize: 12 }} axisLine={false} tickLine={false} />
<Tooltip cursor={{ fill: '#D9FFF4' }} contentStyle={{ borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }} />
<Bar dataKey="count" radius={[6, 6, 0, 0]} name="Assets">
                    {byType.map((entry) => (
<Cell key={entry.type} fill={TYPE_FILL[entry.type] || '#321E48'} />
                    ))}
</Bar>
</BarChart>
</ResponsiveContainer>
            )}
</div>
</Card>

        {/* Assets by status */}
<Card>
<CardHeader title="Assets by Status" subtitle="Lifecycle distribution" />
<div className="p-5">
            {byStatus.length === 0 ? (
<p className="py-10 text-center text-sm text-slateblue-400">No assets to chart.</p>
            ) : (
<ResponsiveContainer width="100%" height={260}>
<PieChart>
<Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2}>
                    {byStatus.map((entry) => (
<Cell key={entry.status} fill={STATUS_FILL[entry.status] || '#43637E'} />
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