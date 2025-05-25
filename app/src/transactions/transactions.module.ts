import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TransactionRepository } from './transactions.repository';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionRepository],
})
export class TransactionsModule {}
