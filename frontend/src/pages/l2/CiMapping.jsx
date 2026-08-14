import { useMemo, useState } from 'react';
import { Network, Boxes, GitBranch } from 'lucide-react';
import { PageHeader, Badge, Input, Tabs } from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Drawer from '../../components/ui/Drawer.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { humanize, ENVIRONMENTS, CI_STATUS_BADGE } from '../../lib/constants.js';
import { listConfigItems } from '../../api/assets.js';

const ENV_FILTERS = ['ALL', ...ENVIRONMENTS];

// Parse the comma/space separated dependsOnCIIDs string into numeric ids.
const parseDeps = (raw) =>
  String(raw || '')
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);

export default function CiMapping() {
  const { data, loading, error, reload } = useAsync(listConfigItems);
  const [env, setEnv] = useState('ALL');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const byId = useMemo(() => {
    const map = {};
    (data || []).forEach((c) => (map[c.ciID] = c));
    return map;
  }, [data]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || [])
      .filter((c) => env === 'ALL' || c.environment === env)
      .filter((c) =>
        !q
        || String(c.ciName || '').toLowerCase().includes(q)
        || String(c.ciType || '').toLowerCase().includes(q)
        || String(c.owner || '').toLowerCase().includes(q)
      );
  }, [data, env, query]);

  const columns = [
    { key: 'ciID', header: 'ID', render: (r) => <span className="font-semibold text-plum">#{r.ciID}</span> },
    { key: 'ciName', header: 'CI Name', render: (r) => <span className="font-medium text-gray-700">{r.ciName}</span> },
    { key: 'ciType', header: 'Type', render: (r) => r.ciType || '—' },
    { key: 'environment', header: 'Environment', render: (r) => (r.environment ? <Badge className="bg-slateblue-100 text-slateblue-700">{humanize(r.environment)}</Badge> : '—') },
    { key: 'owner', header: 'Owner', render: (r) => r.owner || '—' },
    { key: 'linkedAssetID', header: 'Linked Asset', render: (r) => (r.linkedAssetID != null ? `Asset #${r.linkedAssetID}` : '—') },
    { key: 'dependsOnCIIDs', header: 'Depends On', render: (r) => r.dependsOnCIIDs || '—' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} map={CI_STATUS_BADGE} /> },
  ];

  return (
    <div>
      <PageHeader title="CI Asset Mapping" subtitle="Read-only inspection of the configuration management database" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={ENV_FILTERS.map((f) => ({ value: f, label: f === 'ALL' ? 'All environments' : humanize(f) }))}
          active={env}
          onChange={setEnv}
        />
        <div className="w-full max-w-xs">
          <Input placeholder="Search by name, type or owner…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        onRowClick={setSelected}
        rowKey={(r) => r.ciID}
        emptyIcon={Network}
        emptyTitle="No configuration items"
        emptyMessage="No CIs match the current filters."
      />

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? selected.ciName : ''}
        subtitle={selected ? `CI #${selected.ciID}` : ''}
      >
        {selected && (
          <div className="space-y-5 text-sm">
            <div className="flex items-center gap-2">
              {selected.environment && <Badge className="bg-slateblue-100 text-slateblue-700">{humanize(selected.environment)}</Badge>}
              <StatusBadge value={selected.status} map={CI_STATUS_BADGE} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slateblue-600">
              <Detail label="Type" value={selected.ciType || '—'} />
              <Detail label="Owner" value={selected.owner || '—'} />
              <Detail label="Environment" value={selected.environment ? humanize(selected.environment) : '—'} />
              <Detail label="Linked asset" value={selected.linkedAssetID != null ? `Asset #${selected.linkedAssetID}` : '—'} />
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 font-medium text-slateblue-500">
                <GitBranch size={15} /> Dependencies
              </p>
              {parseDeps(selected.dependsOnCIIDs).length === 0 ? (
                <p className="rounded-lg border border-dashed border-slateblue-200 px-4 py-3 text-center text-xs text-slateblue-400">
                  No upstream dependencies recorded.
                </p>
              ) : (
                <ul className="space-y-2">
                  {parseDeps(selected.dependsOnCIIDs).map((depId) => {
                    const dep = byId[depId];
                    return (
                      <li key={depId} className="flex items-center gap-3 rounded-lg border border-slateblue-100 px-3 py-2">
                        <span className="rounded-md bg-mint p-1.5 text-cyanaccent-600">
                          <Boxes size={14} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-700">
                            {dep ? dep.ciName : `CI #${depId}`}
                          </p>
                          <p className="text-[11px] text-slateblue-400">
                            {dep ? `#${dep.ciID} · ${dep.ciType || 'Unknown type'}` : 'Not found in current view'}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <span className="block text-slateblue-400">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}
