import { IsISO8601, IsNumber, Min } from 'class-validator';

export class BillRequestDto {
  @IsISO8601()
  billingPeriodStart: string;

  @IsISO8601()
  billingPeriodEnd: string;

  @IsNumber()
  @Min(0)
  transactionCount: number;
}
