import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionRepository } from './transactions.repository';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class TransactionsService {
  constructor(private transactionRepository: TransactionRepository) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const maxRetries = 3;
    const baseDelayMs = 100;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        return await this.transactionRepository.createTransaction(
          createTransactionDto,
        );
      } catch (error) {
        //ロック競合(P2034)が発生した場合はリトライ
        //最大maxRetries回までリトライ
        //リトライ間隔は100msずつ増加(100ms,200ms,300ms)
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === 'P2034' &&
          retryCount < maxRetries - 1
        ) {
          retryCount++;
          const delayMs = baseDelayMs * retryCount;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
        throw error;
      }
    }
  }
}
