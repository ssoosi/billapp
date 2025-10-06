import { Module, forwardRef } from '@nestjs/common';
import { BillingService } from './billing.service';
import { AccountsModule } from '../accounts/accounts.module';
import { CurrenciesModule } from '../currencies/currencies.module';

@Module({
  imports: [forwardRef(() => AccountsModule), CurrenciesModule],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
