import { TrendingDown, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { useAnalysis } from '@/hooks/useAnalysis';

const severityIcon = {
  high: AlertTriangle,
  medium: TrendingUp,
  low: Info,
};

const severityColor = {
  high: { text: 'var(--severity-high)', bg: 'rgba(239, 68, 68, 0.08)', border: 'var(--severity-high)' },
  medium: { text: 'var(--severity-medium)', bg: 'rgba(245, 158, 11, 0.08)', border: 'var(--severity-medium)' },
  low: { text: 'var(--severity-low)', bg: 'rgba(59, 130, 246, 0.08)', border: 'var(--severity-low)' },
};

export function InsightsPage() {
  const { insights } = useAnalysis();
  const severityCounts = {
    high: insights.filter((insight) => insight.severity === 'high').length,
    medium: insights.filter((insight) => insight.severity === 'medium').length,
    low: insights.filter((insight) => insight.severity === 'low').length,
  };

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: '24px' }}>
        <h1 className="font-geist" style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-0.02em' }}>AI Insights</h1>
        <p className="font-geist" style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{insights.length} insights generated from your spending data</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="fade-up" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', animationDelay: '60ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={14} style={{ color: 'var(--severity-high)' }} />
            </div>
            <span className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>High Priority</span>
          </div>
          <span className="font-geist" style={{ fontSize: '24px', fontWeight: 600 }}>{severityCounts.high}</span>
        </div>
        <div className="fade-up" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', animationDelay: '120ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={14} style={{ color: 'var(--severity-medium)' }} />
            </div>
            <span className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Medium Priority</span>
          </div>
          <span className="font-geist" style={{ fontSize: '24px', fontWeight: 600 }}>{severityCounts.medium}</span>
        </div>
        <div className="fade-up" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', animationDelay: '180ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Info size={14} style={{ color: 'var(--severity-low)' }} />
            </div>
            <span className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Low Priority</span>
          </div>
          <span className="font-geist" style={{ fontSize: '24px', fontWeight: 600 }}>{severityCounts.low}</span>
        </div>
      </div>

      {/* Insight cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {insights.map((insight, i) => {
          const Icon = severityIcon[insight.severity];
          const colors = severityColor[insight.severity];
          return (
            <div
              key={insight.id}
              className="fade-up"
              style={{
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-subtle)',
                borderLeft: `3px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '24px',
                transition: 'all 0.3s ease',
                animationDelay: `${240 + i * 60}ms`,
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-overlay)'; e.currentTarget.style.borderLeftWidth = '4px'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-primary)'; e.currentTarget.style.borderLeftWidth = '3px'; }}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: colors.text }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span className="font-geist" style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>{insight.title}</span>
                    <span className="font-geist" style={{ fontSize: '10px', fontWeight: 500, color: colors.text, background: colors.bg, borderRadius: '3px', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{insight.severity}</span>
                  </div>
                  <p className="font-geist" style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>{insight.evidence}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--surface-secondary)', borderRadius: '6px' }}>
                    <TrendingDown size={14} style={{ color: 'var(--chart-emerald)', flexShrink: 0 }} />
                    <p className="font-geist" style={{ fontSize: '12px', color: 'var(--chart-emerald)', lineHeight: 1.5 }}>{insight.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action CTA */}
      <div className="fade-up" style={{ marginTop: '24px', padding: '20px 24px', background: 'var(--surface-secondary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', animationDelay: '500ms' }}>
        <div>
          <p className="font-geist" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Want more personalized insights?</p>
          <p className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Connect your bank account for real-time analysis</p>
        </div>
        <span className="font-geist" style={{ fontSize: '11px', color: 'var(--text-tertiary)', background: 'var(--surface-tertiary)', borderRadius: '4px', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Coming Soon</span>
      </div>
    </div>
  );
}
