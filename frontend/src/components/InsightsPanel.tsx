import { Lightbulb, AlertTriangle, Info } from 'lucide-react';
import type { Insight, Severity } from '@/types';

interface InsightsPanelProps {
  insights: Insight[];
}

const severityConfig: Record<Severity, { color: string; bg: string; label: string; icon: typeof Info }> = {
  high: {
    color: 'var(--severity-high)',
    bg: 'rgba(239, 68, 68, 0.08)',
    label: 'High',
    icon: AlertTriangle,
  },
  medium: {
    color: 'var(--severity-medium)',
    bg: 'rgba(245, 158, 11, 0.08)',
    label: 'Medium',
    icon: AlertTriangle,
  },
  low: {
    color: 'var(--severity-low)',
    bg: 'rgba(59, 130, 246, 0.08)',
    label: 'Low',
    icon: Info,
  },
};

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <div
      className="fade-up"
      style={{
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '24px',
        animationDelay: '360ms',
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Lightbulb size={16} style={{ color: 'var(--text-tertiary)' }} />
        <h2
          className="font-geist"
          style={{
            fontSize: '16px',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          AI Insights
        </h2>
        <span
          className="font-geist"
          style={{
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            background: 'var(--surface-secondary)',
            borderRadius: '4px',
            padding: '1px 7px',
            marginLeft: 'auto',
          }}
        >
          {insights.length}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {insights.map((insight, index) => {
          const config = severityConfig[insight.severity];
          const Icon = config.icon;

          return (
            <div
              key={insight.id}
              className="insight-card"
              style={{
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                borderLeft: `3px solid ${config.color}`,
                borderRadius: '6px',
                padding: '16px',
                cursor: 'default',
                transition: 'all 0.3s ease',
                animationDelay: `${360 + index * 60}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-overlay)';
                e.currentTarget.style.borderLeftWidth = '4px';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface-secondary)';
                e.currentTarget.style.borderLeftWidth = '3px';
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: config.bg,
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  <Icon size={14} style={{ color: config.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="font-geist"
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {insight.title}
                    </span>
                    <span
                      className="font-geist"
                      style={{
                        fontSize: '10px',
                        fontWeight: 500,
                        color: config.color,
                        background: config.bg,
                        borderRadius: '3px',
                        padding: '1px 6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {config.label}
                    </span>
                  </div>
                  <p
                    className="font-geist"
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: '8px',
                    }}
                  >
                    {insight.evidence}
                  </p>
                  <p
                    className="font-geist"
                    style={{
                      fontSize: '12px',
                      color: 'var(--chart-emerald)',
                      lineHeight: 1.5,
                      fontWeight: 400,
                    }}
                  >
                    {insight.recommendation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
