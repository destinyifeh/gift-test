import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { NotificationModule } from '../notification/notification.module';
import { FileModule } from '../file/file.module';
import { AdminModule } from '../admin/admin.module';
import { CountryConfigModule } from '../country-config/country-config.module';

@Module({
  imports: [PrismaModule, EmailModule, NotificationModule, FileModule, AdminModule, CountryConfigModule],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
