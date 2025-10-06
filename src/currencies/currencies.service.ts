import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Currency } from './entities/currency.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';

@Injectable()
export class CurrenciesService {
  private map = new Map<string, Currency>();

  create(dto: CreateCurrencyDto) {
    const key = dto.currency.toUpperCase();
    if (this.map.has(key)) throw new BadRequestException('Currency already exists');
    const currency: Currency = {
      currency: key,
      monthlyFeeGbp: dto.monthlyFeeGbp,
      perTransactionFeeGbp: dto.perTransactionFeeGbp ?? 0.5, // default 0.5 GBP per extra txn
    };
    this.map.set(key, currency);
    return currency;
  }

  find(currency: string): Currency {
    const key = currency.toUpperCase();
    const cur = this.map.get(key);
    if (!cur) throw new NotFoundException(`Currency ${currency} not found`);
    return cur;
  }

  list(): Currency[] {
    return Array.from(this.map.values());
  }
}
