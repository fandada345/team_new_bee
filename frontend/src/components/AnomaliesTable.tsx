import { AlertTriangle } from 'lucide-react';
import type { Anomaly, Severity } from '@/types';

interface AnomaliesTableProps {
  anomalies: Anomaly[];
}

const severityStyles: Record<Severity, { color: string; bg: string }> = {
  high: {
    color: 'var(--severity-high)',
    bg: 'rgba(239, 68, 68, 0.08)',
  },
  medium: {
    color: 'var(--severity-medium)',
    bg: 'rgba(245, 158, 11, 0.08)',
  },
  low: {
    color: 'var(--severity-low)',
    bg: 'rgba(59, 130, 246, 0.08)',
  },
};

export function AnomaliesTable({ anomalies }: AnomaliesTableProps) {
  return (
    <div
      className="fade-up"
      style={{
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '24px',
        animationDelay: '420ms',
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <AlertTriangle size={16} style={{ color: 'var(--text-tertiary)' }} />
        <h2
          className="font-geist"
          style={{
            fontSize: '16px',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          Anomalies Detected
        </h2>
        <span
          className="font-geist"
          style={{
            fontSize: '11px',
            color: 'var(--severity-high)',
            background: 'rgba(239, 68, 68, 0.08)',
            borderRadius: '4px',
            padding: '1px 7px',
            marginLeft: 'auto',
          }}
        >
          {anomalies.length} found
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Date', 'Merchant', 'Category', 'Amount', 'Reason'].map((header) => (
                <th
                  key={header}
                  className="font-geist"
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {anomalies.map((anomaly, index) => {
              const sev = severityStyles[anomaly.severity];
              return (
                <tr
                  key={anomaly.id}
                  className="table-row"
                  style={{
                    animationDelay: `${420 + index * 20}ms`,
                    borderLeft:
                      anomaly.severity === 'high'
                        ? '3px solid var(--severity-high)'
                        : '3px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td
                    className="font-geist"
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      padding: '10px 12px',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    {anomaly.date}
                  </td>
                  <td
                    className="font-geist"
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                      padding: '10px 12px',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    {anomaly.merchant}
                  </td>
                  <td
                    className="font-geist"
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      padding: '10px 12px',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    {anomaly.category}
                  </td>
                  <td
                    className="font-geist"
                    style={{
                      fontSize: '12px',
                      color: sev.color,
                      fontWeight: 500,
                      padding: '10px 12px',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    ${anomaly.amount.toFixed(2)}
                  </td>
                  <td
                    className="font-geist"
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-tertiary)',
                      padding: '10px 12px',
                      borderBottom: '1px solid var(--border-subtle)',
                      maxWidth: '200px',
                    }}
                  >
                    {anomaly.reason}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
