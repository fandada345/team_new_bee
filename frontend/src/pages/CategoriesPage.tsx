import { PieChart } from 'lucide-react';
import { useAnalysis } from '@/hooks/useAnalysis';

export function CategoriesPage() {
  const { categoryBreakdown } = useAnalysis();
  const _total = categoryBreakdown.reduce((sum, d) => sum + d.totalSpending, 0);
  void _total;

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: '24px' }}>
        <h1 className="font-geist" style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-0.02em' }}>Categories</h1>
        <p className="font-geist" style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{categoryBreakdown.length} spending categories tracked</p>
      </div>

      {/* Summary */}
      <div className="fade-up" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px', marginBottom: '24px', animationDelay: '60ms' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <PieChart size={18} style={{ color: 'var(--text-tertiary)' }} />
          <h2 className="font-geist" style={{ fontSize: '16px', fontWeight: 500 }}>Category Overview</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {categoryBreakdown.slice(0, 4).map(cat => (
            <div key={cat.category} style={{ padding: '16px', background: 'var(--surface-secondary)', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: cat.color }} />
                <span className="font-geist" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{cat.category}</span>
              </div>
              <span className="font-geist" style={{ fontSize: '20px', fontWeight: 600, display: 'block' }}>${cat.totalSpending.toFixed(2)}</span>
              <span className="font-geist" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{cat.share}% of total</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Detail Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {categoryBreakdown.map((cat, i) => (
          <div
            key={cat.category}
            className="fade-up"
            style={{
              background: 'var(--surface-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '20px 24px',
              animationDelay: `${120 + i * 40}ms`,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-secondary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-primary)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: cat.color }} />
              <span className="font-geist" style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>{cat.category}</span>
              <span className="font-geist" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>${cat.totalSpending.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
              <span className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{cat.transactions} transactions</span>
              <span className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{cat.share}% of total spending</span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', background: 'var(--surface-secondary)', overflow: 'hidden' }}>
              <div style={{ width: `${cat.share}%`, height: '100%', background: cat.color, borderRadius: '4px', transition: 'width 1s ease-out' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
