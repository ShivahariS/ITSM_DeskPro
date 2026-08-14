import { useState } from 'react';
import { PackageSearch, ShieldAlert } from 'lucide-react';
import {
  PageHeader, Card, Tabs, Loading, ErrorState, EmptyState,
} from '../../components/ui/index.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDate } from '../../lib/format.js';
import { humanize, ASSET_STATUS_BADGE, LICENSE_STATUS_BADGE } from '../../lib/constants.js';
import { listExpiringWarranty, listExpiringLicenses } from '../../api/assets.js';

const TABS = [
  { value: 'warranties', label: 'Warranties (30 days)' },
  { value: 'licenses', label: 'Licenses (30 days)' },
];

// Whole days from now until the given date (negative = already past).
const daysUntil = (value) => {
  if (!value) return null;
  const target = new Date(String(value).slice(0, 10));
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / 86400000);
};

// Rows expiring within 7 days (or already lapsed) get a stronger highlight.
const rowClass = (days) => {
  if (days == null) return '';
  if (days <= 7) return 'bg-red-50';
  return 'bg-amber-50';
};

function DaysBadge({ days }) {
  if (days == null) return <span className="text-gray-400">—</span>;
  if (days < 0) return <span className="text-xs font-semibold text-red-600">Expired {Math.abs(days)}d ago</span>;
  if (days === 0) return <span className="text-xs font-semibold text-red-600">Expires today</span>;
  const tone = days <= 7 ? 'text-red-600' : 'text-amber-600';
  return <span className={`text-xs font-semibold ${tone}`}>{days} day{days === 1 ? '' : 's'} left</span>;
}

export default function ExpiryAlerts() {
  const [tab, setTab] = useState('warranties');
  const warranties = useAsync(listExpiringWarranty);
  const licenses = useAsync(listExpiringLicenses);

  const active = tab === 'warranties' ? warranties : licenses;

  return (
    <div>
      <PageHeader title="Expiry Alerts" subtitle="Warranties and licenses lapsing within the next 30 days" />

      <div className="mb-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      <Card className="overflow-hidden">
        {active.loading ? (
          <Loading />
        ) : active.error ? (
          <ErrorState message={active.error} onRetry={active.reload} />
        ) : !active.data || active.data.length === 0 ? (
          <EmptyState
            icon={tab === 'warranties' ? PackageSearch : ShieldAlert}
            title={tab === 'warranties' ? 'No warranties expiring soon' : 'No licenses expiring soon'}
            message="Nothing lapses within the next 30 days."
          />
        ) : tab === 'warranties' ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Serial Number</th>
                  <th>Warranty Expiry</th>
                  <th>Countdown</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {warranties.data.map((a) => {
                  const days = daysUntil(a.warrantyExpiry);
                  return (
                    <tr key={a.assetID} className={rowClass(days)}>
                      <td>
                        <span className="font-semibold text-plum">#{a.assetID}</span>
                        <span className="ml-2 text-slateblue-600">
                          {humanize(a.assetType)}{[a.make, a.model].filter(Boolean).length ? ` · ${[a.make, a.model].filter(Boolean).join(' ')}` : ''}
                        </span>
                      </td>
                      <td>{a.serialNumber || '—'}</td>
                      <td>{formatDate(a.warrantyExpiry)}</td>
                      <td><DaysBadge days={days} /></td>
                      <td><StatusBadge value={a.status} map={ASSET_STATUS_BADGE} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Software</th>
                  <th>Vendor</th>
                  <th>Expiry Date</th>
                  <th>Seats</th>
                  <th>Countdown</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {licenses.data.map((l) => {
                  const days = daysUntil(l.expiryDate);
                  return (
                    <tr key={l.licenseID} className={rowClass(days)}>
                      <td><span className="font-semibold text-plum">{l.softwareName}</span></td>
                      <td>{l.vendor || '—'}</td>
                      <td>{formatDate(l.expiryDate)}</td>
                      <td>{(l.usedSeats ?? 0)}/{(l.totalSeats ?? 0)}</td>
                      <td><DaysBadge days={days} /></td>
                      <td><StatusBadge value={l.status} map={LICENSE_STATUS_BADGE} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
