import { Module } from '@nestjs/common';
import { FlexCardController } from './flex-card.controller';
import { FlexCardService } from './flex-card.service';

@Module({
  controllers: [FlexCardController],
  providers: [FlexCardService]
})
export class FlexCardModule {}
