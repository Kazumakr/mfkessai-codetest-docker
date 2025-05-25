import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionRepository {
  constructor(private prisma: PrismaService) {}

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    return this.prisma.$transaction(
      async (tx) => {
        //取引金額累計を取得。行ロック
        const result = await tx.$queryRaw<{ total: number }[]>`
          SELECT SUM(amount) as total
          FROM transactions
          WHERE user_id = ${createTransactionDto.user_id}
          FOR UPDATE;
        `;

        //postgresqlの場合は集約関数とFOR UPDATEを同時利用できないので、以下のように一時的なテーブルを作成
        // const result = await tx.$queryRaw<{ total: number }[]>`
        // WITH tmpTransactions AS (
        //   SELECT amount FROM transactions
        //   WHERE user_id = ${createTransactionDto.user_id}
        //   FOR UPDATE
        // )
        // SELECT SUM(t.amount) as total
        // FROM tmpTransactions t;
        // `;

        const currentTotal = result[0].total;
        const totalAmount = Number(currentTotal) + createTransactionDto.amount;

        //取引金額の上限を超えている場合はエラーを返す(main_test.goのテストでPayment_requiredを想定している)
        if (totalAmount > 1000) {
          throw new HttpException(
            'Transaction amount exceeds the limit',
            HttpStatus.PAYMENT_REQUIRED,
          );
        }

        //問題なければ取引を記録
        return await tx.transaction.create({
          data: {
            userId: createTransactionDto.user_id,
            amount: createTransactionDto.amount,
            description: createTransactionDto.description,
          },
        });
      },
      {
        //今回の要件では上限金額を分離レベルは最も厳格なSerializableを採用
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }
}
