import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { FileModule } from '../file/file.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, FileModule, EmailModule],
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignModule {}
