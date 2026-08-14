import { useMemo, useState } from 'react';
import { ScrollText, Search, X } from 'lucide-react';
import { PageHeader, Card, Field, Input, Select, Button, Badge } from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDateTime } from '../../lib/format.js';
import { humanize } from '../../lib/constants.js';
import { listAuditLogs, listAuditLogsByUser } from '../../api/audit.js';

export default function AuditLogs() {
  const [userFilter, setUserFilter] = useState(''); // committed numeric user id
  const [userInput, setUserInput] = useState('');
  const [entityType, setEntityType] = useState('');

  // Fetcher switches based on the committed user id filter.
  const fetcher = useMemo(() => {
    const id = userFilter.trim();
    return id ? () => listAuditLogsByUser(Number(id)) : listAuditLogs;
  }, [userFilter]);

  const { data, loading, error, reload } = useAsync(fetcher, [fetcher]);

  const logs = useMemo(() => {
    const list = data || [];
    return [...list].sort((a, b) => {
      const da = new Date(a.timestamp || 0).getTime();
      const db = new Date(b.timestamp || 0).getTime();
      if (db !== da) return db - da;
      return (b.auditID || 0) - (a.auditID || 0);
    });
  }, [data]);

  const entityTypes = useMemo(() => {
    const set = new Set();
    logs.forEach((l) => l.entityType && set.add(l.entityType));
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(
    () => (entityType ? logs.filter((l) => l.entityType === entityType) : logs),
    [logs, entityType]
  );

  const applyUser = () => setUserFilter(userInput.trim());
  const clearUser = () => {
    setUserInput('');
    setUserFilter('');
  };

  const columns = [
    { key: 'auditID', header: 'Audit ID', render: (l) => <span className="font-semibold text-plum">#{l.auditID}</span> },
    { key: 'userID', header: 'User ID', render: (l) => (l.userID != null ? `#${l.userID}` : '—') },
    { key: 'action', header: 'Action', render: (l) => <span className="font-medium text-gray-700">{l.action}</span> },
    {
      key: 'entityType',
      header: 'Entity Type',
      render: (l) => (l.entityType ? <Badge className="bg-slateblue-100 text-slateblue-700">{humanize(l.entityType)}</Badge> : '—'),
    },
    { key: 'recordID', header: 'Record ID', render: (l) => (l.recordID != null ? `#${l.recordID}` : '—') },
    { key: 'timestamp', header: 'Timestamp', render: (l) => formatDateTime(l.timestamp) },
  ];

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="System activity and change history (newest first)" />

      <Card className="mb-6 p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Filter by entity type">
            <Select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              placeholder="All entity types"
              options={entityTypes.map((t) => ({ value: t, label: humanize(t) }))}
            />
          </Field>
          <Field label="Filter by user ID" hint="Loads only this user's audit trail.">
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyUser()}
                placeholder="e.g. 5"
              />
              <Button size="sm" onClick={applyUser}>
                <Search size={14} />
              </Button>
            </div>
          </Field>
          <div className="flex items-end">
            {userFilter && (
              <Button variant="ghost" size="sm" onClick={clearUser}>
                <X size={14} /> Clear user #{userFilter}
              </Button>
            )}
          </div>
        </div>
      </Card>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={reload}
        rowKey={(l) => l.auditID}
        emptyIcon={ScrollText}
        emptyTitle="No audit logs"
        emptyMessage="No audit activity matches the current filters."
      />
    </div>
  );
}
