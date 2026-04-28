import { Module } from '@nestjs/common';
import { UserGiftCardController } from './user-gift-card.controller';
import { UserGiftCardService } from './user-gift-card.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [UserGiftCardController],
  providers: [UserGiftCardService],
  exports: [UserGiftCardService],
})
export class UserGiftCardModule {}
