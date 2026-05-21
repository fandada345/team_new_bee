import { DollarSign, CreditCard, TrendingUp, CalendarRange } from 'lucide-react';
import type { KPIData } from '@/types';

interface KPICardsProps {
  data: KPIData;
}

const cards = [
  {
    key: 'totalSpending' as const,
    label: 'Total Spending',
    icon: DollarSign,
    prefix: '$',
    decimals: 2,
  },
  {
    key: 'totalTransactions' as const,
    label: 'Total Transactions',
    icon: CreditCard,
    prefix: '',
    decimals: 0,
  },
  {
    key: 'averageTransaction' as const,
    label: 'Average Transaction',
    icon: TrendingUp,
    prefix: '$',
    decimals: 2,
  },
  {
    key: 'dateRange' as const,
    label: 'Date Range',
    icon: CalendarRange,
    prefix: '',
    decimals: 0,
  },
];

export function KPICards({ data }: KPICardsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        const value = data[card.key];
        const displayValue =
          typeof value === 'number'
            ? `${card.prefix}${value.toLocaleString('en-US', {
                minimumFractionDigits: card.decimals,
                maximumFractionDigits: card.decimals,
              })}`
            : value;

        return (
          <div
            key={card.key}
            className="fade-up"
            style={{
              background: 'var(--surface-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '20px',
              animationDelay: `${index * 60}ms`,
              transition: 'border-color 0.2s, background 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-focus)';
              e.currentTarget.style.background = 'var(--surface-overlay)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.background = 'var(--surface-primary)';
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon
                size={16}
                style={{
                  color: 'var(--text-tertiary)',
                  strokeWidth: 1.5,
                }}
              />
              <span
                className="font-geist"
                style={{
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  fontWeight: 400,
                }}
              >
                {card.label}
              </span>
            </div>
            <span
              className="font-geist"
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {displayValue}
            </span>
          </div>
        );
      })}
    </div>
  );
}
