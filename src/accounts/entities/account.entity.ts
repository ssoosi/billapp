export class Account {
    accountId: string;
    currency: string; // e.g. 'GBP'
    transactionThreshold: number;
    discountDays: number; // integer number of days
    discountRate: number; // percent (0-100)
    createdAt: Date;
  }
  