import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
