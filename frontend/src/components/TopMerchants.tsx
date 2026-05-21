import { Store } from 'lucide-react';
import type { TopMerchant } from '@/types';

interface TopMerchantsProps {
  merchants: TopMerchant[];
}

export function TopMerchants({ merchants }: TopMerchantsProps) {
  const maxSpending = Math.max(...merchants.map((m) => m.totalSpending), 1);

  return (
    <div
      className="fade-up"
      style={{
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '24px',
        animationDelay: '480ms',
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Store size={16} style={{ color: 'var(--text-tertiary)' }} />
        <h2
          className="font-geist"
          style={{
            fontSize: '16px',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          Top Merchants
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {merchants.length === 0 && (
          <p className="font-geist" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            No merchant totals were generated for this CSV.
          </p>
        )}
        {merchants.map((merchant, index) => {
          const barWidth = (merchant.totalSpending / maxSpending) * 100;

          return (
            <div
              key={merchant.id}
              className="merchant-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '6px',
                cursor: 'default',
                transition: 'background 0.2s',
                animationDelay: `${480 + index * 20}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Rank */}
              <span
                className="font-geist"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-tertiary)',
                  width: '18px',
                  textAlign: 'center',
                }}
              >
                {index + 1}
              </span>

              {/* Avatar */}
              <div
                className="flex items-center justify-center"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: `${merchant.color}15`,
                  color: merchant.color,
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'Geist',
                  flexShrink: 0,
                }}
              >
                {merchant.initials}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="font-geist"
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {merchant.name}
                  </span>
                  <span
                    className="font-geist"
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}
                  >
                    ${merchant.totalSpending.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div
                    style={{
                      flex: 1,
                      height: '3px',
                      borderRadius: '2px',
                      background: 'var(--surface-secondary)',
                      overflow: 'hidden',
                      marginRight: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        background: merchant.color,
                        borderRadius: '2px',
                        transition: 'width 1s ease-out',
                      }}
                    />
                  </div>
                  <span
                    className="font-geist"
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-tertiary)',
                      flexShrink: 0,
                    }}
                  >
                    {merchant.transactionCount} txns
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
