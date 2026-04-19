import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { FileModule } from '../file/file.module';
import { EmailModule } from '../email/email.module';
import { NotificationModule } from '../notification/notification.module';
import { GiftModule } from '../gift/gift.module';

@Module({
  imports: [PrismaModule, FileModule, EmailModule, NotificationModule, GiftModule],
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignModule {}
