import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import {
  PageHeader, Card, Loading, ErrorState, EmptyState,
} from '../../components/ui/index.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatDate, formatDateTime } from '../../lib/format.js';
import {
  humanize, RISK_BADGE, CHANGE_STATUS_BADGE,
} from '../../lib/constants.js';
import { listChanges } from '../../api/changes.js';

// Group key: calendar day (yyyy-mm-dd) of the planned start.
const dayKey = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

export default function ChangeCalendar() {
  const { data, loading, error, reload } = useAsync(listChanges);

  const groups = useMemo(() => {
    const scheduled = (data || [])
      .filter((c) => c.plannedStartDate)
      .sort((a, b) => new Date(a.plannedStartDate) - new Date(b.plannedStartDate));

    const map = new Map();
    scheduled.forEach((c) => {
      const key = dayKey(c.plannedStartDate);
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    });
    return Array.from(map.entries());
  }, [data]);

  return (
    <div>
      <PageHeader title="Change Schedule" subtitle="Upcoming change windows in chronological order" />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title="No scheduled changes"
            message="Changes with a planned start date will appear on the schedule."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map(([day, items]) => (
            <div key={day}>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-lg bg-plum px-3 py-1 text-sm font-semibold text-white">
                  {formatDate(day)}
                </span>
                <span className="text-xs text-slateblue-400">{items.length} change{items.length === 1 ? '' : 's'}</span>
              </div>
              <div className="space-y-3">
                {items.map((c) => (
                  <Card key={c.changeID} className="flex items-start gap-4 p-4">
                    <span className="mt-0.5 rounded-lg bg-mint p-2 text-plum">
                      <CalendarDays size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-plum">#{c.changeID} — {c.title}</span>
                        <StatusBadge value={c.riskLevel} map={RISK_BADGE} />
                        <StatusBadge value={c.status} map={CHANGE_STATUS_BADGE} />
                      </div>
                      <p className="mt-1 text-xs text-slateblue-500">
                        {humanize(c.changeType)}
                      </p>
                      <p className="mt-1.5 text-sm text-slateblue-700">
                        <span className="text-slateblue-400">Window: </span>
                        {formatDateTime(c.plannedStartDate)} – {formatDateTime(c.plannedEndDate)}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
