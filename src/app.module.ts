import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsModule } from './accounts/accounts.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [CurrenciesModule, AccountsModule, BillingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
