import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Clock, ShieldCheck, Send, PackageSearch,
  Laptop, KeyRound, Shield, Wifi, HelpCircle
} from 'lucide-react';
import {
  PageHeader, Card, Loading, ErrorState, EmptyState, Button, Field, Textarea, Badge,
} from '../../components/ui/index.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useAsync } from '../../lib/hooks.js';
import { formatSlaHours } from '../../lib/format.js';
import { humanize, CATALOG_CATEGORIES } from '../../lib/constants.js';
import { listCatalog, createServiceRequest } from '../../api/catalog.js';

const CATEGORY_TABS = ['ALL', ...CATALOG_CATEGORIES];

const CATEGORY_ICONS = {
  HARDWARE: Laptop,
  SOFTWARE: KeyRound,
  ACCESS: Shield,
  NETWORK: Wifi,
  OTHER: HelpCircle,
};

export default function ServiceCatalog() {
  const { data, loading, error, reload } = useAsync(listCatalog);
  const [category, setCategory] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const items = useMemo(() => {
    const active = (data || []).filter((i) => i.active !== false);
    return category === 'ALL' ? active : active.filter((i) => i.category === category);
  }, [data, category]);

  const openRequest = (item) => {
    setSelected(item);
    setDetails('');
  };

  const submitRequest = async () => {
    setSubmitting(true);
    try {
      await createServiceRequest({ catalogItemID: selected.itemID, details: details.trim() || null });
      toast.success('Service request submitted');
      setSelected(null);
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Service Catalog" subtitle="Browse and order hardware, software, access and network services" />

      {/* Category filter grid */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              category === cat
                ? 'bg-plum text-white'
                : 'border border-slateblue-200 bg-white text-slateblue-600 hover:bg-mint'
            }`}
          >
            {cat === 'ALL' ? 'All Categories' : humanize(cat)}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState icon={PackageSearch} title="No catalog items" message="No services available in this category." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = CATEGORY_ICONS[item.category] || PackageSearch;
            return (
              <Card key={item.itemID} hover className="flex flex-col p-5 group transition-all duration-200 hover:-translate-y-0.5">
                <div className="mb-2 flex items-center justify-between">
                  <Badge className="bg-slateblue-100 text-slateblue-700">{humanize(item.category)}</Badge>
                  {item.approvalRequired && (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                      <ShieldCheck size={13} /> Approval
                    </span>
                  )}
                </div>
                <div className="flex items-start gap-3 my-2 flex-1">
                  <div className="mt-0.5 rounded-lg bg-slateblue-50 p-2 text-plum transition-colors group-hover:bg-mint">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-plum leading-tight">{item.serviceName}</h3>
                    <p className="mt-1 text-sm text-slateblue-500 leading-normal">{item.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slateblue-600">
                    <Clock size={14} className="text-cyanaccent-600" />
                    SLA {formatSlaHours(item.fulfilmentSLAHours)}
                  </span>
                  <Button size="sm" onClick={() => openRequest(item)}>
                    Request
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.serviceName}
        subtitle="Submit a service request"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={submitRequest} disabled={submitting}>
              <Send size={16} /> {submitting ? 'Submitting…' : 'Submit request'}
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-lg bg-mint px-4 py-3 text-sm text-slateblue-700">
              <p>{selected.description}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-xs">
                <span className="flex items-center gap-1"><Clock size={13} /> SLA {formatSlaHours(selected.fulfilmentSLAHours)}</span>
                <span>{selected.approvalRequired ? 'Requires approval' : 'No approval needed'}</span>
                <span>{humanize(selected.category)}</span>
              </div>
            </div>
            <Field label="Additional details" hint="Describe anything the fulfilment team should know.">
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g. Required by end of next week for a new starter…"
              />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}
