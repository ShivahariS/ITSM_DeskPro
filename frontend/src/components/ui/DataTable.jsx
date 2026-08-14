import { Card, Loading, ErrorState, EmptyState } from './index.jsx';
import { Inbox } from 'lucide-react';

/**
 * Generic table.
 * columns: [{ key, header, render?(row), className?, align? }]
 * rows: array of objects
 * onRowClick: optional (row) => void
 */
export default function DataTable({
  columns,
  rows,
  loading,
  error,
  onRetry,
  onRowClick,
  rowKey = (r, i) => i,
  emptyTitle = 'No records found',
  emptyMessage,
  emptyIcon = Inbox,
}) {
  return (
    <Card className="overflow-hidden">
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : !rows || rows.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={col.headerClassName || ''} style={col.align ? { textAlign: col.align } : undefined}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={rowKey(row, i)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={onRowClick ? 'cursor-pointer' : ''}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={col.className || ''} style={col.align ? { textAlign: col.align } : undefined}>
                      {col.render ? col.render(row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
