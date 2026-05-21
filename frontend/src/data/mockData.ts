import type {
  KPIData,
  CategoryBreakdown,
  TrendPoint,
  Insight,
  Anomaly,
  TopMerchant,
  LargeTransaction,
} from '@/types';

export const kpiData: KPIData = {
  totalSpending: 4231.5,
  totalTransactions: 142,
  averageTransaction: 29.8,
  dateRange: 'May 1 - May 31',
};

export const categoryBreakdown: CategoryBreakdown[] = [
  { category: 'Rent', totalSpending: 1850.0, transactions: 1, share: 43.7, color: '#3B82F6' },
  { category: 'Groceries', totalSpending: 620.5, transactions: 24, share: 14.7, color: '#10B981' },
  { category: 'Dining', totalSpending: 485.25, transactions: 18, share: 11.5, color: '#F97316' },
  { category: 'Shopping', totalSpending: 420.0, transactions: 12, share: 9.9, color: '#A855F7' },
  { category: 'Utilities', totalSpending: 310.75, transactions: 4, share: 7.3, color: '#6366F1' },
  { category: 'Transport', totalSpending: 285.5, transactions: 22, share: 6.7, color: '#14B8A6' },
  { category: 'Subscriptions', totalSpending: 178.5, transactions: 8, share: 4.2, color: '#EC4899' },
  { category: 'Other', totalSpending: 81.0, transactions: 53, share: 1.9, color: '#6B7280' },
];

export const weeklyTrend: TrendPoint[] = [
  { date: 'W1', weekly: 890, monthly: 3200, count: 32 },
  { date: 'W2', weekly: 1120, monthly: 3400, count: 38 },
  { date: 'W3', weekly: 950, monthly: 3600, count: 35 },
  { date: 'W4', weekly: 1271.5, monthly: 4231.5, count: 37 },
];

export const monthlyTrend: TrendPoint[] = [
  { date: 'Oct', weekly: 0, monthly: 3890, count: 128 },
  { date: 'Nov', weekly: 0, monthly: 4120, count: 135 },
  { date: 'Dec', weekly: 0, monthly: 3980, count: 130 },
  { date: 'Jan', weekly: 0, monthly: 4231.5, count: 142 },
];

export const insights: Insight[] = [
  {
    id: '1',
    title: 'Highest Spending Category',
    evidence: 'Rent accounts for 43.7% of your total spending at $1,850/month.',
    recommendation: 'Consider finding a roommate to split rent and reduce this to ~25% of income.',
    severity: 'medium',
    category: 'Rent',
  },
  {
    id: '2',
    title: 'Dining Frequency Spike',
    evidence: 'You\'ve dined out 12 times this week, 40% more than your weekly average.',
    recommendation: 'Try meal prepping 2 days a week. You could save ~$120/month.',
    severity: 'medium',
    category: 'Dining',
  },
  {
    id: '3',
    title: 'Subscription Stack Growing',
    evidence: 'You\'re paying for 8 subscriptions totaling $178.50/month. 3 have overlapping features.',
    recommendation: 'Review Netflix, Spotify, and Apple Music — consider family plans or annual billing.',
    severity: 'low',
    category: 'Subscriptions',
  },
  {
    id: '4',
    title: 'Recent Spending Surge',
    evidence: 'Week 4 spending is 34% higher than Week 1 ($1,271 vs $890).',
    recommendation: 'Set a weekly spending alert at $1,000 to catch surges early.',
    severity: 'high',
    category: 'Trend',
  },
  {
    id: '5',
    title: 'Transport Costs Optimizable',
    evidence: 'You spent $285.50 on transport this month, mostly on ride-sharing.',
    recommendation: 'A monthly transit pass costs $75 and could cover 80% of your trips.',
    severity: 'low',
    category: 'Transport',
  },
];

export const anomalies: Anomaly[] = [
  {
    id: '1',
    date: 'Jan 28',
    merchant: 'Best Buy',
    category: 'Shopping',
    amount: 429.99,
    reason: '3.2x above category average ($134)',
    threshold: 134.0,
    severity: 'high',
  },
  {
    id: '2',
    date: 'Jan 24',
    merchant: 'Whole Foods',
    category: 'Groceries',
    amount: 187.5,
    reason: '2.8x above your grocery average ($67)',
    threshold: 67.0,
    severity: 'medium',
  },
  {
    id: '3',
    date: 'Jan 15',
    merchant: 'Uber',
    category: 'Transport',
    amount: 89.75,
    reason: '2.1x above transport average ($43)',
    threshold: 43.0,
    severity: 'low',
  },
  {
    id: '4',
    date: 'Jan 9',
    merchant: 'Steam',
    category: 'Subscriptions',
    amount: 59.99,
    reason: 'One-time game purchase in subscription category',
    threshold: 22.3,
    severity: 'low',
  },
  {
    id: '5',
    date: 'Jan 5',
    merchant: 'Amazon',
    category: 'Shopping',
    amount: 245.0,
    reason: '1.8x above shopping average ($134)',
    threshold: 134.0,
    severity: 'medium',
  },
];

export const topMerchants: TopMerchant[] = [
  { id: '1', name: 'Whole Foods', initials: 'WF', totalSpending: 620.5, transactionCount: 24, color: '#10B981' },
  { id: '2', name: 'Chipotle', initials: 'CH', totalSpending: 285.75, transactionCount: 18, color: '#F97316' },
  { id: '3', name: 'Uber', initials: 'UB', totalSpending: 285.5, transactionCount: 22, color: '#14B8A6' },
  { id: '4', name: 'Amazon', initials: 'AM', totalSpending: 245.0, transactionCount: 5, color: '#A855F7' },
  { id: '5', name: 'Netflix', initials: 'NF', totalSpending: 178.5, transactionCount: 8, color: '#EC4899' },
  { id: '6', name: 'Starbucks', initials: 'SB', totalSpending: 156.0, transactionCount: 14, color: '#8B5CF6' },
];

export const largeTransactions: LargeTransaction[] = [
  { id: '1', date: 'Jan 1', merchant: 'Apt Management Co', category: 'Rent', amount: 1850.0 },
  { id: '2', date: 'Jan 28', merchant: 'Best Buy', category: 'Shopping', amount: 429.99 },
  { id: '3', date: 'Jan 15', merchant: 'City Electric', category: 'Utilities', amount: 185.5 },
  { id: '4', date: 'Jan 5', merchant: 'Amazon', category: 'Shopping', amount: 245.0 },
  { id: '5', date: 'Jan 24', merchant: 'Whole Foods', category: 'Groceries', amount: 187.5 },
  { id: '6', date: 'Jan 10', merchant: 'Metro Transit', category: 'Transport', amount: 75.0 },
  { id: '7', date: 'Jan 22', merchant: 'Chipotle', category: 'Dining', amount: 48.5 },
  { id: '8', date: 'Jan 8', merchant: 'Spotify', category: 'Subscriptions', amount: 19.99 },
];
