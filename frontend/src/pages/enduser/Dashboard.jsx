import { Link } from 'react-router-dom';
import { AlertTriangle, ShoppingCart, Ticket, Clock, CheckCircle2, Star, ArrowRight } from 'lucide-react';
import { PageHeader, Card, StatCard, Loading, ErrorState, Button } from '../../components/ui/index.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { fromNow, truncate } from '../../lib/format.js';
import { INCIDENT_STATUS_BADGE, PRIORITY_BADGE } from '../../lib/constants.js';
import { listMyIncidents } from '../../api/incidents.js';
import { listMyServiceRequests } from '../../api/catalog.js';

export default function Dashboard() {
  const { user } = useAuth();
  const incidents = useAsync(listMyIncidents);
  const requests = useAsync(listMyServiceRequests);

  const loading = incidents.loading || requests.loading;
  const error = incidents.error || requests.error;

  const inc = incidents.data || [];
  const open = inc.filter((i) => ['OPEN', 'REOPENED'].includes(i.status)).length;
  const inProgress = inc.filter((i) => ['IN_PROGRESS', 'PENDING'].includes(i.status)).length;
  const resolved = inc.filter((i) => ['RESOLVED', 'CLOSED'].includes(i.status)).length;
  const awaitingRating = inc.filter((i) => i.status === 'RESOLVED');

  const recent = [...inc]
    .sort((a, b) => new Date(b.loggedDate) - new Date(a.loggedDate))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle="Your IT support at a glance"
      />

      {/* CSAT prompt */}
      {awaitingRating.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyanaccent-200 bg-mint px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-cyanaccent-300 p-2 text-plum">
              <Star size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-plum">
                You have {awaitingRating.length} resolved ticket{awaitingRating.length > 1 ? 's' : ''} to rate
              </p>
              <p className="text-xs text-slateblue-500">Your feedback helps us improve the service desk.</p>
            </div>
          </div>
          <Link to="/enduser/my-tickets">
            <Button variant="accent" size="sm">
              Rate now <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Link to="/enduser/report-incident">
          <Card hover className="flex items-center gap-4 p-5">
            <span className="rounded-xl bg-red-50 p-3 text-red-500">
              <AlertTriangle size={24} />
            </span>
            <div>
              <p className="text-base font-semibold text-plum">Report an Outage</p>
              <p className="text-sm text-slateblue-500">Something broken? Log an incident.</p>
            </div>
          </Card>
        </Link>
        <Link to="/enduser/catalog">
          <Card hover className="flex items-center gap-4 p-5">
            <span className="rounded-xl bg-mint p-3 text-cyanaccent-600">
              <ShoppingCart size={24} />
            </span>
            <div>
              <p className="text-base font-semibold text-plum">Request Equipment</p>
              <p className="text-sm text-slateblue-500">Browse the service catalog.</p>
            </div>
          </Card>
        </Link>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={() => { incidents.reload(); requests.reload(); }} />
      ) : (
        <>
          {/* Active ticket tracker */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Open Tickets" value={open} icon={Ticket} tone="warn" />
            <StatCard label="In Progress" value={inProgress} icon={Clock} tone="accent" />
            <StatCard label="Recently Resolved" value={resolved} icon={CheckCircle2} tone="success" />
            <StatCard label="Active Requests" value={(requests.data || []).length} icon={ShoppingCart} />
          </div>

          {/* Recent updates feed */}
          <Card>
            <div className="border-b border-slateblue-100 px-5 py-4">
              <h3 className="text-base font-semibold text-plum">Recent Updates</h3>
            </div>
            {recent.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slateblue-400">No recent activity.</p>
            ) : (
              <ul className="divide-y divide-slateblue-100">
                {recent.map((i) => (
                  <li key={i.incidentID} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-700">
                        #{i.incidentID} · {truncate(i.description, 60)}
                      </p>
                      <p className="text-xs text-slateblue-400">Logged {fromNow(i.loggedDate)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge value={i.priority} map={PRIORITY_BADGE} />
                      <StatusBadge value={i.status} map={INCIDENT_STATUS_BADGE} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
