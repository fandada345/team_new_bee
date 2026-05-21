import { ParticleHero } from '@/components/ParticleHero';
import { KPICards } from '@/components/KPICards';
import { TrendChart } from '@/components/TrendChart';
import { CategoryChart } from '@/components/CategoryChart';
import { InsightsPanel } from '@/components/InsightsPanel';
import { AnomaliesTable } from '@/components/AnomaliesTable';
import { TopMerchants } from '@/components/TopMerchants';
import { LargeTransactions } from '@/components/LargeTransactions';
import { UploadArea } from '@/components/UploadArea';
import { useAnalysis } from '@/hooks/useAnalysis';

export function DashboardPage() {
  const {
    anomalies,
    analyzeFile,
    categoryBreakdown,
    clearError,
    hasUploadedAnalysis,
    insights,
    kpiData,
    largeTransactions,
    monthlyTrend,
    resetUpload,
    state,
    topMerchants,
    weeklyTrend,
  } = useAnalysis();

  return (
    <>
      <ParticleHero />

      <div className="fade-up" style={{ marginTop: '32px', marginBottom: '24px', animationDelay: '60ms' }}>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
          <div>
            <h1 className="font-geist" style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Spending Overview
            </h1>
            <p className="font-geist" style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {kpiData.dateRange} &middot; {kpiData.totalTransactions} transactions analyzed
            </p>
          </div>
          <div>
            <span className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)', background: 'var(--surface-secondary)', borderRadius: '6px', padding: '6px 14px', border: '1px solid var(--border-subtle)' }}>
              {hasUploadedAnalysis ? 'Uploaded analysis' : 'Demo data'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <UploadArea state={state} onFileSelect={analyzeFile} onClear={() => { clearError(); resetUpload(); }} />
      </div>

      <KPICards data={kpiData} />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <TrendChart weeklyData={weeklyTrend} monthlyData={monthlyTrend} />
        <CategoryChart data={categoryBreakdown} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <InsightsPanel insights={insights} />
        <AnomaliesTable anomalies={anomalies} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <TopMerchants merchants={topMerchants} />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <LargeTransactions transactions={largeTransactions} />
      </div>

      <footer className="fade-up" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '24px', paddingBottom: '32px', animationDelay: '600ms' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Spend Insight AI &mdash; University Project Demo</span>
          <span className="font-geist" style={{ fontSize: '11px', color: 'var(--text-tertiary)', opacity: 0.5 }}>v1.0.0</span>
        </div>
      </footer>
    </>
  );
}
