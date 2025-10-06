import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { BillRequestDto } from './dto/bill-request.dto';
import { BillingService } from '../billing/billing.service';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly billingService: BillingService,
  ) {}

  @Post()
  create(@Body() dto: CreateAccountDto) {
    return this.accountsService.create(dto);
  }

  @Get()
  list() {
    return this.accountsService.list();
  }

  @Post(':accountId/bill')
  async bill(@Param('accountId') accountId: string, @Body() dto: BillRequestDto) {
    return this.billingService.calculate(accountId, dto);
  }
}
