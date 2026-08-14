import { Badge } from '../ui/index.jsx';
import { humanize, GENERIC_BADGE } from '../../lib/constants.js';

// Renders a coloured pill for an enum value using the supplied colour map.
export default function StatusBadge({ value, map, label }) {
  if (value == null || value === '') return <span className="text-gray-400">—</span>;
  const cls = (map && map[value]) || GENERIC_BADGE;
  return <Badge className={cls}>{label || humanize(value)}</Badge>;
}
