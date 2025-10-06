import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { CurrenciesService } from '../currencies/currencies.service';
import { BillRequestDto } from '../accounts/dto/bill-request.dto';
import { BillingResult, MonthlySegment } from './dto/billing-result.dto';

@Injectable()
export class BillingService {
  constructor(
    private accountsService: AccountsService,
    private currenciesService: CurrenciesService,
  ) {}

  private daysBetweenInclusive(a: Date, b: Date) {
    const msPerDay = 1000 * 60 * 60 * 24;
    const start = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const end = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((end - start) / msPerDay) + 1;
  }

  private startOfMonth(d: Date) {
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1));
  }

  private endOfMonth(d: Date) {
    return new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 0));
  }

  private round2(n: number) {
    return Math.round(n * 100) / 100;
  }

  async calculate(accountId: string, dto: BillRequestDto): Promise<BillingResult> {
    const account = this.accountsService.find(accountId);
    const currency = this.currenciesService.find(account.currency);

    const start = new Date(dto.billingPeriodStart);
    const end = new Date(dto.billingPeriodEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new BadRequestException('Invalid dates');
    if (start > end) throw new BadRequestException('billingPeriodStart must be <= billingPeriodEnd');

    // Build month segments
    const segments: Array<{
      month: string;
      monthStart: Date;
      monthEnd: Date;
      daysInMonth: number;
      daysCovered: number;
    }> = [];

    let cursor = this.startOfMonth(start);
    const final = end;
    while (cursor <= final) {
      const monthStart = this.startOfMonth(cursor);
      const monthEnd = this.endOfMonth(cursor);
      const segStart = start > monthStart ? start : monthStart;
      const segEnd = end < monthEnd ? end : monthEnd;

      const daysInMonth = this.daysBetweenInclusive(monthStart, monthEnd);
      const daysCovered = this.daysBetweenInclusive(segStart, segEnd);

      segments.push({
        month: `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`,
        monthStart,
        monthEnd,
        daysInMonth,
        daysCovered,
      });

      cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
    }

    const totalBillingDays = segments.reduce((s, seg) => s + seg.daysCovered, 0);

    // allocate transactions proportionally by days (integers: use floor, remainder to last)
    const totalTx = Math.max(0, Math.floor(dto.transactionCount));
    const txAlloc: number[] = [];
    let allocated = 0;
    for (let i = 0; i < segments.length; i++) {
      if (i === segments.length - 1) {
        txAlloc.push(totalTx - allocated);
      } else {
        const raw = (totalTx * (segments[i].daysCovered / totalBillingDays));
        const val = Math.floor(raw);
        txAlloc.push(val);
        allocated += val;
      }
    }

    const perTxFee = currency.perTransactionFeeGbp ?? 0.5;
    const perMonthDetails: MonthlySegment[] = [];

    let baseFeeTotal = 0;
    let transactionFeesTotal = 0;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const txForMonth = txAlloc[i];
      const extra = Math.max(0, txForMonth - account.transactionThreshold);
      const transactionFees = extra * perTxFee;
      // prorated base fee for calendar month
      const proratedBaseFee = (currency.monthlyFeeGbp * (seg.daysCovered / seg.daysInMonth));
      baseFeeTotal += proratedBaseFee;
      transactionFeesTotal += transactionFees;

      perMonthDetails.push({
        month: seg.month,
        daysInMonth: seg.daysInMonth,
        daysCovered: seg.daysCovered,
        proratedBaseFee: this.round2(proratedBaseFee),
        transactionsAllocated: txForMonth,
        extraTransactions: extra,
        transactionFees: this.round2(transactionFees),
      });
    }

    baseFeeTotal = this.round2(baseFeeTotal);
    transactionFeesTotal = this.round2(transactionFeesTotal);
    const subtotal = this.round2(baseFeeTotal + transactionFeesTotal);

    // compute discount overlap
    let discountAmount = 0;
    if (account.discountDays > 0 && account.discountRate > 0) {
      const promoStart = account.createdAt;
      const promoEnd = new Date(Date.UTC(promoStart.getUTCFullYear(), promoStart.getUTCMonth(), promoStart.getUTCDate()));
      promoEnd.setUTCDate(promoEnd.getUTCDate() + account.discountDays - 1); // inclusive

      const overlapStart = promoStart > start ? promoStart : start;
      const overlapEnd = promoEnd < end ? promoEnd : end;

      let discountOverlapDays = 0;
      if (overlapStart <= overlapEnd) {
        discountOverlapDays = this.daysBetweenInclusive(overlapStart, overlapEnd);
      }

      if (discountOverlapDays > 0) {
        const fraction = discountOverlapDays / totalBillingDays;
        discountAmount = this.round2(subtotal * fraction * (account.discountRate / 100));
      }
    }

    const totalGbp = this.round2(subtotal - discountAmount);

    const result: BillingResult = {
      accountId,
      billingPeriodStart: start.toISOString(),
      billingPeriodEnd: end.toISOString(),
      totalBillingDays,
      baseFeeTotal,
      transactionFeesTotal,
      subtotal,
      discountAmount,
      totalGbp,
      perMonth: perMonthDetails,
    };

    return result;
  }
}
