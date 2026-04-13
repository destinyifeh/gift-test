import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddBankAccountDto } from './dto/add-bank-account.dto';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { platformBalance: true },
    });
    
    // Prisma returns BigInt, convert to string/number if needed 
    return { balance: (user as any)?.platformBalance?.toString() || '0' };
  }

  async getBankAccounts(userId: string) {
    return (this.prisma as any).bankAccount.findMany({
      where: { userId },
      orderBy: { isPrimary: 'desc' },
    });
  }

  async addBankAccount(userId: string, data: AddBankAccountDto) {
    return (this.prisma as any).$transaction(async (tx: any) => {
      // If setting as primary, unset others
      if (data.isPrimary) {
        await (tx as any).bankAccount.updateMany({
          where: { userId },
          data: { isPrimary: false },
        });
      }

      // If it's the first bank account, verify it as primary
      const existingAccounts = await (tx as any).bankAccount.count({ where: { userId } });
      const isPrimary = existingAccounts === 0 ? true : data.isPrimary;

      return (tx as any).bankAccount.create({
        data: {
          ...data,
          isPrimary,
          userId,
        },
      });
    });
  }

  async removeBankAccount(userId: string, accountId: string) {
    const account = await (this.prisma as any).bankAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    await (this.prisma as any).bankAccount.delete({
      where: { id: accountId },
    });

    return { success: true, message: 'Bank account removed' };
  }

  async getTransactions(userId: string, page: number = 1, limit: number = 10) {
    const { skip, take } = getPaginationOptions(page, limit);

    const [transactions, total] = await Promise.all([
      (this.prisma as any).transaction.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma as any).transaction.count({ where: { userId } }),
    ]);

    // Handle BigInt serialization
    const mappedTxs = transactions.map((tx: any) => ({
      ...tx,
      amount: (tx as any).amount.toString(),
    }));

    return paginate(mappedTxs, total, page, limit);
  }

  // --- Internal Helper Methods (System Use) ---
  
  async addFunds(userId: string, amount: bigint, type: string, description: string, reference?: string) {
    return (this.prisma as any).$transaction(async (tx: any) => {
      const user = await (tx as any).user.update({
        where: { id: userId },
        data: { platformBalance: { increment: amount } },
      });

      const transaction = await (tx as any).transaction.create({
        data: {
          userId,
          amount,
          type,
          status: 'success',
          description,
          reference,
        },
      });

      return { user, transaction };
    });
  }

  async deductFunds(userId: string, amount: bigint, type: string, description: string) {
    return (this.prisma as any).$transaction(async (tx: any) => {
      const user = await (tx as any).user.findUnique({ where: { id: userId } });
      if (!user || (user as any).platformBalance < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      await (tx as any).user.update({
        where: { id: userId },
        data: { platformBalance: { decrement: amount } },
      });

      const transaction = await (tx as any).transaction.create({
        data: {
          userId,
          amount,
          type,
          status: 'success',
          description,
        },
      });

      return { transaction };
    });
  }
}
