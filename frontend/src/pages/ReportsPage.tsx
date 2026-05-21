import { Receipt, Store, ArrowDownToLine } from 'lucide-react';
import { useAnalysis } from '@/hooks/useAnalysis';

export function ReportsPage() {
  const { topMerchants, largeTransactions } = useAnalysis();

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="font-geist" style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-0.02em' }}>Reports</h1>
            <p className="font-geist" style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Detailed spending reports and analysis</p>
          </div>
          <button
            className="font-geist"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              opacity: 0.5,
            }}
            title="Coming soon"
          >
            <ArrowDownToLine size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Top Merchants */}
      <div className="fade-up" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px', marginBottom: '24px', animationDelay: '60ms' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Store size={18} style={{ color: 'var(--text-tertiary)' }} />
          <h2 className="font-geist" style={{ fontSize: '18px', fontWeight: 500 }}>Top Merchants</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {topMerchants.length === 0 && (
            <p className="font-geist" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              No merchant totals were generated for this CSV.
            </p>
          )}
          {topMerchants.map((merchant, i) => {
            const maxSpending = Math.max(...topMerchants.map(m => m.totalSpending), 1);
            const barWidth = (merchant.totalSpending / maxSpending) * 100;
            return (
              <div
                key={merchant.id}
                className="fade-up"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  background: 'var(--surface-secondary)',
                  animationDelay: `${120 + i * 30}ms`,
                  transition: 'background 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-tertiary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-secondary)')}
              >
                <span className="font-geist" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-tertiary)', width: '20px', textAlign: 'center' }}>{i + 1}</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${merchant.color}18`, color: merchant.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, fontFamily: 'Geist' }}>
                  {merchant.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="font-geist" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{merchant.name}</span>
                    <span className="font-geist" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>${merchant.totalSpending.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'var(--surface-tertiary)', overflow: 'hidden' }}>
                      <div style={{ width: `${barWidth}%`, height: '100%', background: merchant.color, borderRadius: '2px', transition: 'width 1s ease-out' }} />
                    </div>
                    <span className="font-geist" style={{ fontSize: '11px', color: 'var(--text-tertiary)', flexShrink: 0 }}>{merchant.transactionCount} txns</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Largest Transactions */}
      <div className="fade-up" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px', animationDelay: '240ms' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Receipt size={18} style={{ color: 'var(--text-tertiary)' }} />
          <h2 className="font-geist" style={{ fontSize: '18px', fontWeight: 500 }}>Largest Transactions</h2>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Date', 'Merchant', 'Category', 'Amount'].map(h => (
                <th key={h} className="font-geist" style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.03em', textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {largeTransactions.length === 0 && (
              <tr>
                <td colSpan={4} className="font-geist" style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                  No large transactions were generated for this CSV.
                </td>
              </tr>
            )}
            {largeTransactions.map((txn, i) => (
              <tr
                key={txn.id}
                className="table-row"
                style={{ animationDelay: `${300 + i * 20}ms`, cursor: 'default' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td className="font-geist" style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '12px', borderBottom: '1px solid var(--border-subtle)' }}>{txn.date}</td>
                <td className="font-geist" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', padding: '12px', borderBottom: '1px solid var(--border-subtle)' }}>{txn.merchant}</td>
                <td className="font-geist" style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '12px', borderBottom: '1px solid var(--border-subtle)' }}>{txn.category}</td>
                <td className="font-geist" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', padding: '12px', borderBottom: '1px solid var(--border-subtle)' }}>${txn.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
