import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AddBankAccountDto } from './dto/add-bank-account.dto';
import type { Request } from 'express';

@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.walletService.getBalance(userId);
  }

  @Get('banks')
  async getBankAccounts(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.walletService.getBankAccounts(userId);
  }

  @Post('banks')
  async addBankAccount(@Req() req: Request, @Body() data: AddBankAccountDto) {
    const userId = (req as any).user.id;
    return this.walletService.addBankAccount(userId, data);
  }

  @Delete('banks/:id')
  async removeBankAccount(@Req() req: Request, @Param('id') accountId: string) {
    const userId = (req as any).user.id;
    return this.walletService.removeBankAccount(userId, accountId);
  }

  @Get('transactions')
  async getTransactions(
    @Req() req: Request,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const userId = (req as any).user.id;
    return this.walletService.getTransactions(userId, Number(page) || 1, Number(limit) || 10);
  }
}
