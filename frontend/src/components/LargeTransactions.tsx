import { Receipt } from 'lucide-react';
import type { LargeTransaction } from '@/types';

interface LargeTransactionsProps {
  transactions: LargeTransaction[];
}

export function LargeTransactions({ transactions }: LargeTransactionsProps) {
  return (
    <div
      className="fade-up"
      style={{
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '24px',
        animationDelay: '540ms',
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Receipt size={16} style={{ color: 'var(--text-tertiary)' }} />
        <h2
          className="font-geist"
          style={{
            fontSize: '16px',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          Largest Transactions
        </h2>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Date', 'Merchant', 'Category', 'Amount'].map((header) => (
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
            {transactions.map((txn, index) => (
              <tr
                key={txn.id}
                className="table-row"
                style={{
                  animationDelay: `${540 + index * 20}ms`,
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
                  {txn.date}
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
                  {txn.merchant}
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
                  {txn.category}
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
                  ${txn.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
