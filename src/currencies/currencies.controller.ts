import { Body, Controller, Get, Post} from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Post()
  create(@Body() dto: CreateCurrencyDto) {
    return this.currenciesService.create(dto);
  }

  @Get()
  list() {
    return this.currenciesService.list();
  }
}
