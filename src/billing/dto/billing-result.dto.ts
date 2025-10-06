export interface MonthlySegment {
    month: string; // e.g. '2025-10'
    daysInMonth: number;
    daysCovered: number;
    proratedBaseFee: number;
    transactionsAllocated: number;
    extraTransactions: number;
    transactionFees: number;
  }
  
  export interface BillingResult {
    accountId: string;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    totalBillingDays: number;
    baseFeeTotal: number;
    transactionFeesTotal: number;
    subtotal: number;
    discountAmount: number;
    totalGbp: number;
    perMonth: MonthlySegment[];
  }
  