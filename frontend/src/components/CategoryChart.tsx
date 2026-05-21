import type { CategoryBreakdown } from '@/types';

interface CategoryChartProps {
  data: CategoryBreakdown[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const total = data.reduce((sum, d) => sum + d.totalSpending, 0);

  // SVG donut chart
  const size = 140;
  const center = size / 2;
  const radius = 55;
  const innerRadius = 38;

  const segments = data.reduce<Array<{ path: string; color: string; category: string; endAngle: number }>>((result, cat) => {
    const angle = (cat.share / 100) * Math.PI * 2;
    const startAngle = result.at(-1)?.endAngle ?? -Math.PI / 2;
    const endAngle = startAngle + angle;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const ix1 = center + innerRadius * Math.cos(startAngle);
    const iy1 = center + innerRadius * Math.sin(startAngle);
    const ix2 = center + innerRadius * Math.cos(endAngle);
    const iy2 = center + innerRadius * Math.sin(endAngle);

    const path = [
      `M ${ix1} ${iy1}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ');

    result.push({ path, color: cat.color, category: cat.category, endAngle });
    return result;
  }, []);

  return (
    <div className="fade-up" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px', animationDelay: '300ms' }}>
      <h2 className="font-geist" style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '20px' }}>Category Breakdown</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Donut Chart */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
          {segments.map((seg, i) => (
            <path key={i} d={seg.path} fill={seg.color} stroke="var(--surface-primary)" strokeWidth="1.5" style={{ transition: 'opacity 0.2s' }} />
          ))}
          {/* Center text */}
          <text x={center} y={center - 2} textAnchor="middle" fill="var(--text-primary)" fontSize="14" fontWeight="600" fontFamily="Geist">${(total / 1000).toFixed(1)}k</text>
          <text x={center} y={center + 10} textAnchor="middle" fill="var(--text-tertiary)" fontSize="7" fontFamily="Geist">Total</text>
        </svg>

        {/* Category List */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {data.map((cat) => (
            <div key={cat.category} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: cat.color, flexShrink: 0 }} />
              <span className="font-geist" style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>{cat.category}</span>
              <span className="font-geist" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{cat.transactions} txns</span>
              <span className="font-geist" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', width: '36px', textAlign: 'right' }}>{cat.share}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
        {data.map((cat) => (
          <div key={`bar-${cat.category}`} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="font-geist" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{cat.category}</span>
              <span className="font-geist" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{cat.share}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', background: 'var(--surface-secondary)', overflow: 'hidden' }}>
              <div style={{ width: `${cat.share}%`, height: '100%', background: cat.color, borderRadius: '3px', transition: 'width 1s ease-out' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
