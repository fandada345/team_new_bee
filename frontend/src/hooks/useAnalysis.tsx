import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  anomalies as fallbackAnomalies,
  categoryBreakdown as fallbackCategoryBreakdown,
  insights as fallbackInsights,
  kpiData as fallbackKpiData,
  largeTransactions as fallbackLargeTransactions,
  monthlyTrend as fallbackMonthlyTrend,
  topMerchants as fallbackTopMerchants,
  weeklyTrend as fallbackWeeklyTrend,
} from '@/data/mockData';
import type {
  Anomaly,
  AppState,
  Category,
  CategoryBreakdown,
  ErrorType,
  Insight,
  KPIData,
  LargeTransaction,
  Severity,
  TopMerchant,
  TrendPoint,
} from '@/types';

interface BackendResponse {
  summary: {
    total_transactions: number;
    total_spending: number;
    average_transaction: number;
    date_range: { start: string | null; end: string | null };
  };
  category_breakdown: Array<{
    category: Category;
    total_spending: number;
    transaction_count: number;
    share_percentage: number;
  }>;
  trends: {
    weekly?: Array<{ period: string; total_spending: number; transaction_count: number }>;
    monthly?: Array<{ period: string; total_spending: number; transaction_count: number }>;
  };
  top_merchants: Array<{
    merchant: string;
    total_spending: number;
    transaction_count: number;
  }>;
  largest_transactions: Array<{
    date: string;
    merchant: string;
    category: Category;
    amount: number;
  }>;
  anomalies: Array<{
    date: string;
    merchant: string;
    category: Category;
    amount: number;
    threshold: number;
    reason: string;
  }>;
  insights: Array<{
    title: string;
    evidence: string;
    recommendation: string;
    severity: Severity;
  }>;
}

interface AnalysisData {
  kpiData: KPIData;
  categoryBreakdown: CategoryBreakdown[];
  weeklyTrend: TrendPoint[];
  monthlyTrend: TrendPoint[];
  insights: Insight[];
  anomalies: Anomaly[];
  topMerchants: TopMerchant[];
  largeTransactions: LargeTransaction[];
}

interface AnalysisContextValue extends AnalysisData {
  state: AppState;
  hasUploadedAnalysis: boolean;
  analyzeFile: (file: File) => Promise<void>;
  clearError: () => void;
  resetUpload: () => void;
}

const STORAGE_KEY = 'spend-insight-analysis';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';
const colors: Record<Category, string> = {
  Groceries: '#10B981',
  Dining: '#F97316',
  Transport: '#14B8A6',
  Rent: '#3B82F6',
  Utilities: '#6366F1',
  Subscriptions: '#EC4899',
  Shopping: '#A855F7',
  Other: '#6B7280',
};
const initialState: AppState = {
  status: 'idle',
  errorType: null,
  errorMessage: '',
  fileName: '',
  fileSize: '',
};
const fallbackData: AnalysisData = {
  kpiData: fallbackKpiData,
  categoryBreakdown: fallbackCategoryBreakdown,
  weeklyTrend: fallbackWeeklyTrend,
  monthlyTrend: fallbackMonthlyTrend,
  insights: fallbackInsights,
  anomalies: fallbackAnomalies,
  topMerchants: fallbackTopMerchants,
  largeTransactions: fallbackLargeTransactions,
};

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

function formatDateRange(start: string | null, end: string | null) {
  if (!start && !end) return 'Uploaded CSV';
  if (!start) return `Through ${end}`;
  if (!end || start === end) return start;
  return `${start} - ${end}`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'TX';
}

function anomalySeverity(amount: number, threshold: number): Severity {
  const ratio = threshold > 0 ? amount / threshold : 1;
  if (ratio >= 3) return 'high';
  if (ratio >= 2) return 'medium';
  return 'low';
}

function parseStoredAnalysis() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnalysisData) : null;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function mapTrend(
  rows: Array<{ period: string; total_spending: number; transaction_count: number }> = [],
  key: 'weekly' | 'monthly'
): TrendPoint[] {
  return rows.map((row) => ({
    date: row.period,
    weekly: key === 'weekly' ? row.total_spending : 0,
    monthly: key === 'monthly' ? row.total_spending : 0,
    count: row.transaction_count,
  }));
}

function toAnalysisData(response: BackendResponse): AnalysisData {
  return {
    kpiData: {
      totalSpending: response.summary.total_spending,
      totalTransactions: response.summary.total_transactions,
      averageTransaction: response.summary.average_transaction,
      dateRange: formatDateRange(
        response.summary.date_range.start,
        response.summary.date_range.end
      ),
    },
    categoryBreakdown: response.category_breakdown.map((item) => ({
      category: item.category,
      totalSpending: item.total_spending,
      transactions: item.transaction_count,
      share: item.share_percentage,
      color: colors[item.category] ?? colors.Other,
    })),
    weeklyTrend: mapTrend(response.trends.weekly, 'weekly'),
    monthlyTrend: mapTrend(response.trends.monthly, 'monthly'),
    insights: response.insights.map((item, index) => ({
      id: `insight-${index + 1}`,
      ...item,
      category: 'Analysis',
    })),
    anomalies: response.anomalies.map((item, index) => ({
      id: `anomaly-${index + 1}`,
      ...item,
      severity: anomalySeverity(item.amount, item.threshold),
    })),
    topMerchants: response.top_merchants.map((item, index) => ({
      id: `merchant-${index + 1}`,
      name: item.merchant,
      initials: initials(item.merchant),
      totalSpending: item.total_spending,
      transactionCount: item.transaction_count,
      color: Object.values(colors)[index % Object.values(colors).length],
    })),
    largeTransactions: response.largest_transactions.map((item, index) => ({
      id: `transaction-${index + 1}`,
      ...item,
    })),
  };
}

function errorTypeFromDetail(detail: string): ErrorType {
  const text = detail.toLowerCase();
  if (text.includes('empty')) return 'empty_file';
  if (text.includes('column')) return 'missing_columns';
  if (text.includes('date')) return 'invalid_dates';
  if (text.includes('amount')) return 'invalid_amounts';
  if (text.includes('csv')) return 'invalid_csv';
  return 'network_error';
}

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AnalysisData>(() => parseStoredAnalysis() ?? fallbackData);
  const [state, setState] = useState<AppState>(initialState);
  const [hasUploadedAnalysis, setHasUploadedAnalysis] = useState(() => Boolean(parseStoredAnalysis()));

  const analyzeFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setState({
        status: 'error',
        errorType: 'invalid_csv',
        errorMessage: 'Only CSV files are supported.',
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      });
      return;
    }

    const fileSize = `${(file.size / 1024).toFixed(1)} KB`;
    setState({
      status: 'uploading',
      errorType: null,
      errorMessage: '',
      fileName: file.name,
      fileSize,
    });

    const body = new FormData();
    body.append('file', file);

    try {
      setState((previous) => ({ ...previous, status: 'analyzing' }));
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        body,
      });
      const payload = (await response.json()) as BackendResponse & {
        detail?: string;
        errors?: string[];
      };

      if (!response.ok) {
        const detail = payload.detail || 'The analysis server rejected the file.';
        setState((previous) => ({
          ...previous,
          status: 'error',
          errorType: errorTypeFromDetail(detail),
          errorMessage: [detail, ...(payload.errors ?? [])].filter(Boolean).join(' '),
        }));
        return;
      }

      const nextData = toAnalysisData(payload);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
      setData(nextData);
      setHasUploadedAnalysis(true);
      setState((previous) => ({ ...previous, status: 'success' }));
    } catch {
      setState((previous) => ({
        ...previous,
        status: 'error',
        errorType: 'network_error',
        errorMessage: 'Could not connect to the analysis server.',
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState((previous) => ({
      ...previous,
      status: 'idle',
      errorType: null,
      errorMessage: '',
    }));
  }, []);

  const resetUpload = useCallback(() => {
    setState(initialState);
  }, []);

  const value = useMemo(
    () => ({
      ...data,
      state,
      hasUploadedAnalysis,
      analyzeFile,
      clearError,
      resetUpload,
    }),
    [analyzeFile, clearError, data, hasUploadedAnalysis, resetUpload, state]
  );

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) throw new Error('useAnalysis must be used within AnalysisProvider.');
  return context;
}
