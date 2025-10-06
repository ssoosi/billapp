import { IsString, IsNumber, Min, Max, IsOptional, IsISO8601 } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  accountId: string;

  @IsString()
  currency: string;

  @IsNumber()
  @Min(0)
  transactionThreshold: number;

  @IsNumber()
  @Min(0)
  discountDays: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  discountRate: number;

  // optional creation date (ISO) for testing; otherwise server sets now
  @IsOptional()
  @IsISO8601()
  createdAt?: string;
}
