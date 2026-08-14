import { useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ClipboardCheck, Play, CheckCircle2 } from 'lucide-react';
import { PageHeader, Button } from '../../components/ui/index.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDateTime } from '../../lib/format.js';
import { REQUEST_STATUS_BADGE } from '../../lib/constants.js';
import { listServiceRequests, listCatalog, updateServiceRequestStatus } from '../../api/catalog.js';
import { listUsersByRole } from '../../api/users.js';

const OPEN_STATUSES = ['SUBMITTED', 'IN_PROGRESS', 'PENDING_APPROVAL'];

export default function ServiceRequestsQueue() {
  const { data, loading, error, reload } = useAsync(listServiceRequests);
  const catalog = useAsync(listCatalog);
  const [busyId, setBusyId] = useState(null);
  const [assetManagerId, setAssetManagerId] = useState(7);

  useEffect(() => {
    listUsersByRole('ASSET_MANAGER')
      .then((users) => {
        if (users && users.length > 0) {
          setAssetManagerId(users[0].userID);
        }
      })
      .catch((e) => console.error('Error fetching asset manager user:', e));
  }, []);

  useEffect(() => {
    if (data && data.length > 0) {
      data.forEach((r) => {
        if (r.status === 'PENDING_APPROVAL' || r.status === 'IN_PROGRESS' || r.assignedToID === null) {
          localStorage.removeItem('request_rejection_remark_' + r.requestID);
        }
      });
    }
  }, [data]);

  const itemMap = useMemo(() => {
    const map = {};
    (catalog.data || []).forEach((c) => (map[c.itemID] = c));
    return map;
  }, [catalog.data]);

  const setStatus = async (request, status) => {
    setBusyId(request.requestID);
    try {
      const assignedId = status === 'IN_PROGRESS' ? assetManagerId : request.assignedToID;
      await updateServiceRequestStatus(request.requestID, status, assignedId);
      toast.success(`Request #${request.requestID} marked ${status.replace(/_/g, ' ').toLowerCase()}`);
      reload();
    } catch (e) {
      toast.error(e.friendlyMessage || 'An error occurred');
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { key: 'requestID', header: 'Request ID', render: (r) => <span className="font-semibold text-plum">#{r.requestID}</span> },
    { key: 'item', header: 'Item', render: (r) => itemMap[r.catalogItemID]?.serviceName || `Item #${r.catalogItemID}` },
    { key: 'requesterID', header: 'Requester', render: (r) => <span className="text-slateblue-600">User #{r.requesterID}</span> },
    { key: 'submissionDate', header: 'Submitted', render: (r) => formatDateTime(r.submissionDate) },
    { key: 'due', header: 'SLA Target', render: (r) => formatDateTime(r.fulfilmentDueDate) },
    {
      key: 'status',
      header: 'Status',
      render: (r) => {
        const remark = localStorage.getItem('request_rejection_remark_' + r.requestID);
        return (
          <div>
            <StatusBadge value={r.status} map={REQUEST_STATUS_BADGE} />
            {remark && r.status !== 'REJECTED' && r.status !== 'FULFILLED' && (
              <div className="mt-1 text-xs text-red-500 font-medium max-w-xs leading-tight">
                AM Remark: {remark}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions', header: '', render: (r) => {
        if (!OPEN_STATUSES.includes(r.status)) return null;

        const catalogItem = itemMap[r.catalogItemID] || {};
        const category = String(catalogItem.category || r.category || '').toUpperCase();
        const itemName = catalogItem.serviceName || catalogItem.name || r.serviceName || '';
        const textSearch = itemName.toLowerCase();

        const isHardwareOrSoftware =
          category === 'HARDWARE' ||
          category === 'SOFTWARE' ||
          textSearch.includes('laptop') ||
          textSearch.includes('monitor') ||
          textSearch.includes('hardware') ||
          textSearch.includes('software') ||
          textSearch.includes('license') ||
          textSearch.includes('figma') ||
          textSearch.includes('adobe') ||
          textSearch.includes('jetbrains') ||
          textSearch.includes('microsoft');

        if (isHardwareOrSoftware) {
          // Hardware/Software request flow:
          // PENDING_APPROVAL -> L1 click "Start" -> IN_PROGRESS -> Asset Mgr click "Assign" -> SUBMITTED -> L1 click "Fulfil" -> FULFILLED
          // If the Asset Manager rejects it, they also move it to SUBMITTED but set an 'request_rejection_remark_' in localStorage.
          const showStart = r.status === 'PENDING_APPROVAL' || (r.status === 'SUBMITTED' && (r.assignedToID === null || r.assignedToID === assetManagerId));
          
          const remark = localStorage.getItem('request_rejection_remark_' + r.requestID);
          const isRejectedByAM = Boolean(remark);

          const canFulfil = r.status === 'SUBMITTED' && r.assignedToID !== null && r.assignedToID !== assetManagerId && !isRejectedByAM;
          const canReject = r.status === 'SUBMITTED' && r.assignedToID !== null && r.assignedToID !== assetManagerId && isRejectedByAM;

          return (
            <div className="flex items-center gap-2">
              {showStart && (
                <Button size="sm" variant="secondary" disabled={busyId === r.requestID} onClick={() => setStatus(r, 'IN_PROGRESS')}>
                  <Play size={13} /> Start
                </Button>
              )}
              {!isRejectedByAM ? (
                <Button size="sm" variant="accent" disabled={!canFulfil || busyId === r.requestID} onClick={() => setStatus(r, 'FULFILLED')}>
                  <CheckCircle2 size={13} /> Fulfil
                </Button>
              ) : (
                <Button size="sm" variant="danger" disabled={!canReject || busyId === r.requestID} onClick={() => setStatus(r, 'REJECTED')}>
                  <CheckCircle2 size={13} /> Reject Request
                </Button>
              )}
            </div>
          );
        }

        // Standard flow for other categories (e.g. Access, Network)
        return (
          <div className="flex items-center gap-2">
            {r.status !== 'IN_PROGRESS' && (
              <Button size="sm" variant="secondary" disabled={busyId === r.requestID} onClick={() => setStatus(r, 'IN_PROGRESS')}>
                <Play size={13} /> Start
              </Button>
            )}
            <Button size="sm" variant="accent" disabled={busyId === r.requestID} onClick={() => setStatus(r, 'FULFILLED')}>
              <CheckCircle2 size={13} /> Fulfil
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title="Service Requests Queue" subtitle="Progress and fulfil catalog service requests" />

      <DataTable
        columns={columns}
        rows={data}
        loading={loading || catalog.loading}
        error={error}
        onRetry={reload}
        rowKey={(r) => r.requestID}
        emptyIcon={ClipboardCheck}
        emptyTitle="No service requests"
        emptyMessage="Submitted requests will appear here for fulfilment."
      />
    </div>
  );
}
