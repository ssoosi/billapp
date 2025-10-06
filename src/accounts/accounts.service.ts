import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
  private map = new Map<string, Account>();

  create(dto: CreateAccountDto) {
    const id = dto.accountId;
    if (this.map.has(id)) throw new BadRequestException('Account already exists');

    const createdAt = dto.createdAt ? new Date(dto.createdAt) : new Date();
    if (Number.isNaN(createdAt.getTime())) throw new BadRequestException('Invalid createdAt');

    const account: Account = {
      accountId: id,
      currency: dto.currency.toUpperCase(),
      transactionThreshold: dto.transactionThreshold,
      discountDays: dto.discountDays,
      discountRate: dto.discountRate,
      createdAt,
    };
    this.map.set(id, account);
    return account;
  }

  find(accountId: string): Account {
    const acct = this.map.get(accountId);
    if (!acct) throw new NotFoundException('Account not found');
    return acct;
  }

  list(): Account[] {
    return Array.from(this.map.values());
  }
}
