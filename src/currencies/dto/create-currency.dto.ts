import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateCurrencyDto {
  @IsString()
  currency: string;

  @IsNumber()
  @Min(0)
  monthlyFeeGbp: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perTransactionFeeGbp?: number;
}
