import { Module, forwardRef } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [forwardRef(() => BillingModule)],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
