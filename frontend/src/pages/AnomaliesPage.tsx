import { AlertTriangle, Shield, Eye, ArrowUpRight } from 'lucide-react';
import { useAnalysis } from '@/hooks/useAnalysis';

const severityConfig = {
  high: { color: 'var(--severity-high)', bg: 'rgba(239, 68, 68, 0.08)', label: 'High Risk' },
  medium: { color: 'var(--severity-medium)', bg: 'rgba(245, 158, 11, 0.08)', label: 'Medium Risk' },
  low: { color: 'var(--severity-low)', bg: 'rgba(59, 130, 246, 0.08)', label: 'Low Risk' },
};

export function AnomaliesPage() {
  const { anomalies } = useAnalysis();
  const highCount = anomalies.filter(a => a.severity === 'high').length;
  const totalAmount = anomalies.reduce((sum, a) => sum + a.amount, 0);

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: '24px' }}>
        <h1 className="font-geist" style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-0.02em' }}>Anomalies</h1>
        <p className="font-geist" style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{anomalies.length} unusual transactions detected in your data</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="fade-up" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', animationDelay: '60ms' }}>
          <Shield size={18} style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }} />
          <span className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>Total Flagged</span>
          <span className="font-geist" style={{ fontSize: '24px', fontWeight: 600 }}>{anomalies.length}</span>
        </div>
        <div className="fade-up" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', animationDelay: '120ms' }}>
          <AlertTriangle size={18} style={{ color: 'var(--severity-high)', marginBottom: '8px' }} />
          <span className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>High Risk</span>
          <span className="font-geist" style={{ fontSize: '24px', fontWeight: 600, color: 'var(--severity-high)' }}>{highCount}</span>
        </div>
        <div className="fade-up" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', animationDelay: '180ms' }}>
          <ArrowUpRight size={18} style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }} />
          <span className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>Total Amount</span>
          <span className="font-geist" style={{ fontSize: '24px', fontWeight: 600 }}>${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Anomaly cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {anomalies.map((anomaly, i) => {
          const sev = severityConfig[anomaly.severity];
          return (
            <div
              key={anomaly.id}
              className="fade-up"
              style={{
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-subtle)',
                borderLeft: `3px solid ${sev.color}`,
                borderRadius: '8px',
                padding: '20px 24px',
                animationDelay: `${240 + i * 40}ms`,
                transition: 'all 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-secondary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-primary)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="font-geist" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{anomaly.merchant}</span>
                  <span className="font-geist" style={{ fontSize: '11px', color: 'var(--text-tertiary)', background: 'var(--surface-secondary)', borderRadius: '4px', padding: '2px 8px' }}>{anomaly.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="font-geist" style={{ fontSize: '14px', fontWeight: 600, color: sev.color }}>${anomaly.amount.toFixed(2)}</span>
                  <span className="font-geist" style={{ fontSize: '10px', fontWeight: 500, color: sev.color, background: sev.bg, borderRadius: '3px', padding: '2px 8px', textTransform: 'uppercase' }}>{sev.label}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={12} style={{ color: 'var(--text-tertiary)' }} />
                  <span className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{anomaly.reason}</span>
                </div>
                <span className="font-geist" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{anomaly.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
