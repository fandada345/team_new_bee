import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Upload,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  PieChart,
  Receipt,
  Settings,
} from 'lucide-react';
import { useAnalysis } from '@/hooks/useAnalysis';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { insights, anomalies } = useAnalysis();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sources: true,
    analysis: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      style={{
        position: 'fixed',
        top: '48px',
        left: 0,
        bottom: 0,
        width: '256px',
        background: 'var(--surface-primary)',
        borderRight: '1px solid var(--border-subtle)',
        zIndex: 90,
        overflowY: 'auto',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Data Sources */}
      <SidebarSection
        title="Data Sources"
        expanded={expandedSections.sources}
        onToggle={() => toggleSection('sources')}
      >
        <SidebarItem
          icon={<Upload size={14} />}
          label="Upload CSV"
          active={isActive('/upload')}
          onClick={() => navigate('/upload')}
        />
      </SidebarSection>

      {/* Analysis */}
      <SidebarSection
        title="Analysis"
        expanded={expandedSections.analysis}
        onToggle={() => toggleSection('analysis')}
      >
        <SidebarItem
          icon={<BarChart3 size={14} />}
          label="Overview"
          active={isActive('/')}
          onClick={() => navigate('/')}
        />
        <SidebarItem
          icon={<Lightbulb size={14} />}
          label="Insights"
          badge={String(insights.length)}
          active={isActive('/insights')}
          onClick={() => navigate('/insights')}
        />
        <SidebarItem
          icon={<AlertTriangle size={14} />}
          label="Anomalies"
          badge={String(anomalies.length)}
          active={isActive('/anomalies')}
          onClick={() => navigate('/anomalies')}
        />
        <SidebarItem
          icon={<PieChart size={14} />}
          label="Categories"
          active={isActive('/categories')}
          onClick={() => navigate('/categories')}
        />
      </SidebarSection>

      {/* Reports */}
      <div className="mt-2">
        <span
          className="font-geist block px-3 py-2"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-tertiary)',
          }}
        >
          Reports
        </span>
        <SidebarItem
          icon={<Receipt size={14} />}
          label="Largest Transactions"
          active={isActive('/reports')}
          onClick={() => navigate('/reports')}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Settings */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '12px',
          marginTop: '12px',
        }}
      >
        <SidebarItem
          icon={<Settings size={14} />}
          label="Settings"
          active={isActive('/settings')}
          onClick={() => navigate('/settings')}
        />
      </div>

      {/* Future Features */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '12px',
          marginTop: '12px',
        }}
      >
        <span
          className="font-geist block px-3 py-1"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-tertiary)',
          }}
        >
          Coming Soon
        </span>
        <ComingSoonItem label="Budget Tracking" />
        <ComingSoonItem label="Export Reports" />
        <ComingSoonItem label="Bank API Connect" />
      </div>
    </aside>
  );
}

function SidebarSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2 transition-colors"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <span
          className="font-geist"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-tertiary)',
          }}
        >
          {title}
        </span>
        {expanded ? (
          <ChevronDown size={12} style={{ color: 'var(--text-tertiary)' }} />
        ) : (
          <ChevronRight size={12} style={{ color: 'var(--text-tertiary)' }} />
        )}
      </button>
      {expanded && <div className="flex flex-col gap-0.5">{children}</div>}
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-3 py-2 transition-all duration-200"
      style={{
        background: active ? 'var(--surface-overlay)' : 'transparent',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        borderLeft: active ? '2px solid var(--text-primary)' : '2px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'var(--surface-overlay)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      <div className="flex items-center gap-2.5">
        <span style={{ color: active ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{icon}</span>
        <span
          className="font-geist"
          style={{ fontSize: '13px', color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          {label}
        </span>
      </div>
      {badge && (
        <span
          className="font-geist"
          style={{
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            background: 'var(--surface-secondary)',
            borderRadius: '4px',
            padding: '1px 6px',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function ComingSoonItem({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-between px-3 py-1.5"
      style={{ opacity: 0.4, cursor: 'default' }}
    >
      <span className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{label}</span>
      <span
        className="font-geist"
        style={{
          fontSize: '9px',
          color: 'var(--text-tertiary)',
          background: 'var(--surface-secondary)',
          borderRadius: '3px',
          padding: '1px 5px',
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
        }}
      >
        Soon
      </span>
    </div>
  );
}
