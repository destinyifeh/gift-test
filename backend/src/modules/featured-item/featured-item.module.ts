import { Module } from '@nestjs/common';
import { FeaturedItemService } from './featured-item.service';
import { FeaturedItemController } from './featured-item.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FeaturedItemController],
  providers: [FeaturedItemService],
  exports: [FeaturedItemService],
})
export class FeaturedItemModule {}
