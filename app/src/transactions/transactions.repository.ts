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
        //取引金額累計を取得
        const currentTotal = await tx.transaction.aggregate({
          where: { userId: createTransactionDto.user_id },
          _sum: { amount: true },
        });

        //取引金額累計にリクエスト金額を足したもの
        const totalAmount =
          (currentTotal._sum?.amount || 0) + createTransactionDto.amount;

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
