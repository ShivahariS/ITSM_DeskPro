import { useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { PageHeader } from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Drawer from '../../components/ui/Drawer.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDateTime } from '../../lib/format.js';
import { REQUEST_STATUS_BADGE, TEAMS } from '../../lib/constants.js';
import { listMyServiceRequests, listCatalog } from '../../api/catalog.js';

export default function MyRequests() {
  const { data, loading, error, reload } = useAsync(listMyServiceRequests);
  const catalog = useAsync(listCatalog);
  const [selected, setSelected] = useState(null);

  const itemName = useMemo(() => {
    const map = {};
    (catalog.data || []).forEach((c) => (map[c.itemID] = c));
    return map;
  }, [catalog.data]);

  const columns = [
    { key: 'requestID', header: 'Request ID', render: (r) => <span className="font-semibold text-plum">#{r.requestID}</span> },
    { key: 'item', header: 'Service Item', render: (r) => itemName[r.catalogItemID]?.serviceName || `Item #${r.catalogItemID}` },
    { key: 'submissionDate', header: 'Submitted', render: (r) => formatDateTime(r.submissionDate) },
    { key: 'team', header: 'Assigned Team', render: (r) => TEAMS[itemName[r.catalogItemID]?.deliveryTeamID] || '—' },
    { key: 'due', header: 'SLA Target', render: (r) => formatDateTime(r.fulfilmentDueDate) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} map={REQUEST_STATUS_BADGE} /> },
  ];

  return (
    <div>
      <PageHeader title="My Requests" subtitle="Track the lifecycle of your service requests" />

      <DataTable
        columns={columns}
        rows={data}
        loading={loading || catalog.loading}
        error={error}
        onRetry={reload}
        onRowClick={setSelected}
        rowKey={(r) => r.requestID}
        emptyIcon={ClipboardList}
        emptyTitle="No requests yet"
        emptyMessage="Submit a request from the Service Catalog to see it here."
      />

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Request #${selected.requestID}` : ''}
        subtitle={selected ? itemName[selected.catalogItemID]?.serviceName : ''}
      >
        {selected && (
          <div className="space-y-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slateblue-500">Status</span>
              <StatusBadge value={selected.status} map={REQUEST_STATUS_BADGE} />
            </div>
            <DetailRow label="Service item" value={itemName[selected.catalogItemID]?.serviceName || `Item #${selected.catalogItemID}`} />
            <DetailRow label="Category" value={itemName[selected.catalogItemID]?.category} />
            <DetailRow label="Assigned team" value={TEAMS[itemName[selected.catalogItemID]?.deliveryTeamID] || '—'} />
            <DetailRow label="Submitted" value={formatDateTime(selected.submissionDate)} />
            <DetailRow label="SLA target" value={formatDateTime(selected.fulfilmentDueDate)} />
            <div>
              <p className="mb-1 font-medium text-slateblue-500">Your details</p>
              <p className="rounded-lg bg-mint px-4 py-3 text-gray-700">
                {selected.details || 'No additional details provided.'}
              </p>
            </div>
            {selected.status === 'REJECTED' && localStorage.getItem('request_rejection_remark_' + selected.requestID) && (
              <div>
                <p className="mb-1 font-medium text-red-500">Rejection Reason</p>
                <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700 border border-red-200">
                  {localStorage.getItem('request_rejection_remark_' + selected.requestID)}
                </p>
              </div>
            )}

            {/* Approval / fulfilment steps */}
            <div>
              <p className="mb-2 font-medium text-slateblue-500">Fulfilment progress</p>
              <ol className="space-y-2">
                {['SUBMITTED', 'PENDING_APPROVAL', 'IN_PROGRESS', 'FULFILLED'].map((step) => {
                  const order = ['SUBMITTED', 'PENDING_APPROVAL', 'IN_PROGRESS', 'FULFILLED'];
                  const reached = order.indexOf(selected.status) >= order.indexOf(step) || selected.status === 'FULFILLED';
                  const rejected = selected.status === 'REJECTED';
                  return (
                    <li key={step} className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${reached && !rejected ? 'bg-cyanaccent-500' : 'bg-slateblue-200'}`} />
                      <span className={reached && !rejected ? 'text-plum' : 'text-slateblue-400'}>
                        {step.replace(/_/g, ' ')}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slateblue-500">{label}</span>
      <span className="font-medium text-gray-700">{value || '—'}</span>
    </div>
  );
}
