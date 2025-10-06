export class Currency {
    currency: string; // e.g. 'GBP'
    monthlyFeeGbp: number;
    // optional per-transaction fee for extra txns beyond threshold
    perTransactionFeeGbp?: number;
  }
  