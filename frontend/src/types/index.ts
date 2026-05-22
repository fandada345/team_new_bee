export type Severity = 'low' | 'medium' | 'high';

export type Category =
  | 'Groceries'
  | 'Dining'
  | 'Transport'
  | 'Rent'
  | 'Utilities'
  | 'Subscriptions'
  | 'Shopping'
  | 'Other';

export interface KPIData {
  totalSpending: number;
  totalTransactions: number;
  averageTransaction: number;
  dateRange: string;
}

export interface CategoryBreakdown {
  category: Category;
  totalSpending: number;
  transactions: number;
  share: number;
  color: string;
}

export interface TrendPoint {
  date: string;
  weekly: number;
  monthly: number;
  count: number;
}

export interface Insight {
  id: string;
  title: string;
  evidence: string;
  recommendation: string;
  severity: Severity;
  category: string;
}

export interface RiskAssessment {
  status: 'trained_model' | 'model_unavailable';
  label: string;
  probability: number | null;
  severity: Severity;
  summary: string;
  features: Record<string, number>;
}

export interface Anomaly {
  id: string;
  date: string;
  merchant: string;
  category: Category;
  amount: number;
  reason: string;
  threshold: number;
  severity: Severity;
}

export interface TopMerchant {
  id: string;
  name: string;
  initials: string;
  totalSpending: number;
  transactionCount: number;
  color: string;
}

export interface LargeTransaction {
  id: string;
  date: string;
  merchant: string;
  category: Category;
  amount: number;
}

export type AnalysisStatus =
  | 'idle'
  | 'uploading'
  | 'analyzing'
  | 'success'
  | 'error';

export type ErrorType =
  | 'invalid_csv'
  | 'missing_columns'
  | 'invalid_dates'
  | 'invalid_amounts'
  | 'network_error'
  | 'empty_file'
  | null;

export interface AppState {
  status: AnalysisStatus;
  errorType: ErrorType;
  errorMessage: string;
  fileName: string;
  fileSize: string;
}
