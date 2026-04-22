import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { FileModule } from '../file/file.module';
import { CountryConfigModule } from '../country-config/country-config.module';

@Module({
  imports: [PrismaModule, NotificationModule, FileModule, CountryConfigModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
