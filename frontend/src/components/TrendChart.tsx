import { useState } from 'react';
import type { TrendPoint } from '@/types';

interface TrendChartProps {
  weeklyData: TrendPoint[];
  monthlyData: TrendPoint[];
}

export function TrendChart({ weeklyData, monthlyData }: TrendChartProps) {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const data = view === 'weekly' ? weeklyData : monthlyData;

  if (data.length === 0) {
    return (
      <div className="fade-up" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px', animationDelay: '240ms' }}>
        <h2 className="font-geist" style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '12px' }}>Spending Trend</h2>
        <p className="font-geist" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No trend points were generated for this CSV yet.</p>
      </div>
    );
  }

  const values = data.map(d => view === 'weekly' ? d.weekly : d.monthly);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const range = maxVal - minVal || 1;

  // Enlarged viewBox for spread-out data points
  const padLeft = 60;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 40;
  const pointGap = 90; // horizontal gap between data points
  const chartW = padLeft + Math.max(data.length - 1, 1) * pointGap + padRight;
  const chartH = 200;

  const points = data.map((d, i) => {
    const x = padLeft + i * pointGap;
    const y = padTop + (chartH - padTop - padBottom) - ((d[view === 'weekly' ? 'weekly' : 'monthly'] - minVal) / range) * (chartH - padTop - padBottom) * 0.85;
    return { x, y, value: d[view === 'weekly' ? 'weekly' : 'monthly'] as number, label: d.date };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const countValues = data.map(d => d.count);
  const countMax = Math.max(...countValues);
  const countMin = Math.min(...countValues);
  const countRange = countMax - countMin || 1;

  const countPoints = data.map((d, i) => {
    const x = padLeft + i * pointGap;
    const y = padTop + (chartH - padTop - padBottom) - ((d.count - countMin) / countRange) * (chartH - padTop - padBottom) * 0.85;
    return { x, y, value: d.count, label: d.date };
  });

  const countLinePath = countPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="fade-up" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px', animationDelay: '240ms' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 className="font-geist" style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>Spending Trend</h2>
        <div style={{ display: 'flex', background: 'var(--surface-secondary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <button onClick={() => setView('weekly')} className="font-geist" style={{ padding: '5px 14px', fontSize: '12px', fontWeight: view === 'weekly' ? 500 : 400, borderRadius: '5px', border: 'none', background: view === 'weekly' ? 'var(--surface-tertiary)' : 'transparent', color: view === 'weekly' ? 'var(--text-primary)' : 'var(--text-tertiary)', cursor: 'pointer' }}>Weekly</button>
          <button onClick={() => setView('monthly')} className="font-geist" style={{ padding: '5px 14px', fontSize: '12px', fontWeight: view === 'monthly' ? 500 : 400, borderRadius: '5px', border: 'none', background: view === 'monthly' ? 'var(--surface-tertiary)' : 'transparent', color: view === 'monthly' ? 'var(--text-primary)' : 'var(--text-tertiary)', cursor: 'pointer' }}>Monthly</button>
        </div>
      </div>

      <svg viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '260px' }}>
        {/* Grid lines */}
        {[0, 1, 2, 3].map(i => {
          const y = padTop + (i / 3) * (chartH - padTop - padBottom);
          return <line key={`g-${i}`} x1={padLeft} y1={y} x2={chartW - padRight} y2={y} stroke="var(--border-subtle)" strokeWidth="0.5" strokeDasharray="3,3" />;
        })}

        {/* Y-axis labels */}
        {[0, 1, 2, 3].map(i => {
          const val = minVal + (1 - i / 3) * range;
          const y = padTop + (i / 3) * (chartH - padTop - padBottom);
          return <text key={`yl-${i}`} x={padLeft - 8} y={y + 3} fill="var(--text-tertiary)" fontSize="9" textAnchor="end" fontFamily="Geist">${Math.round(val).toLocaleString()}</text>;
        })}

        {/* Spending line */}
        <path d={linePath} fill="none" stroke="var(--chart-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Count line */}
        <path d={countLinePath} fill="none" stroke="var(--chart-indigo)" strokeWidth="1.5" strokeDasharray="4,3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points and interaction areas */}
        {points.map((p, i) => (
          <g key={`p-${i}`}>
            {/* Invisible hover target */}
            <rect x={p.x - 20} y={0} width="40" height={chartH} fill="transparent"
              onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)} />
            {/* Vertical guide line */}
            {hoveredPoint === i && (
              <line x1={p.x} y1={padTop} x2={p.x} y2={chartH - padBottom} stroke="var(--border-subtle)" strokeWidth="0.5" strokeDasharray="3,3" />
            )}
            {/* Spending point */}
            <circle cx={p.x} cy={p.y} r={hoveredPoint === i ? 4 : 2.5} fill="var(--chart-blue)" stroke={hoveredPoint === i ? 'var(--text-primary)' : 'none'} strokeWidth="0.5" style={{ transition: 'r 0.2s' }} />
            {/* Count point */}
            <circle cx={countPoints[i].x} cy={countPoints[i].y} r={hoveredPoint === i ? 3.5 : 2} fill="var(--chart-indigo)" stroke={hoveredPoint === i ? 'var(--text-primary)' : 'none'} strokeWidth="0.5" style={{ transition: 'r 0.2s' }} />
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => (
          <text key={`xl-${i}`} x={p.x} y={chartH - 12} fill="var(--text-tertiary)" fontSize="10" textAnchor="middle" fontFamily="Geist">{p.label}</text>
        ))}

        {/* Tooltip */}
        {hoveredPoint !== null && (
          <g>
            <rect x={Math.max(5, Math.min(points[hoveredPoint].x - 35, chartW - 75))} y={Math.max(5, points[hoveredPoint].y - 38)} width="70" height="28" rx="4" fill="var(--surface-tertiary)" stroke="var(--border-subtle)" strokeWidth="0.5" />
            <text x={Math.max(5, Math.min(points[hoveredPoint].x - 35, chartW - 75)) + 35} y={Math.max(5, points[hoveredPoint].y - 38) + 12} fill="var(--text-primary)" fontSize="9" textAnchor="middle" fontFamily="Geist" fontWeight="500">${points[hoveredPoint].value.toLocaleString()}</text>
            <text x={Math.max(5, Math.min(points[hoveredPoint].x - 35, chartW - 75)) + 35} y={Math.max(5, points[hoveredPoint].y - 38) + 22} fill="var(--text-tertiary)" fontSize="8" textAnchor="middle" fontFamily="Geist">{countPoints[hoveredPoint].value} transactions</text>
          </g>
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '14px', height: '2px', background: 'var(--chart-blue)', borderRadius: '1px' }} />
          <span className="font-geist" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Spending</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '14px', height: '2px', background: 'var(--chart-indigo)', borderRadius: '1px' }} />
          <span className="font-geist" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Transactions</span>
        </div>
      </div>
    </div>
  );
}
