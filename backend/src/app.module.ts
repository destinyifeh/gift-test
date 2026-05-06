import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { VendorModule } from './modules/vendor/vendor.module';
import { PromotionModule } from './modules/promotion/promotion.module';
import { GiftModule } from './modules/gift/gift.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmailModule } from './modules/email/email.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FeaturedItemModule } from './modules/featured-item/featured-item.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { FileModule } from './modules/file/file.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { FlexCardModule } from './modules/flex-card/flex-card.module';
import { CountryConfigModule } from './modules/country-config/country-config.module';
import { GiftCardModule } from './modules/gift-card/gift-card.module';
import { UserGiftCardModule } from './modules/user-gift-card/user-gift-card.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { RatingModule } from './modules/rating/rating.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UserModule,
    CampaignModule,
    WalletModule,
    TransactionModule,
    VendorModule,
    PromotionModule,
    GiftModule,
    AdminModule,
    EmailModule,
    NotificationModule,
    FeaturedItemModule,
    AnalyticsModule,
    FileModule,
    WhatsappModule,
    ModerationModule,
    FlexCardModule,
    CountryConfigModule,
    GiftCardModule,
    UserGiftCardModule,
    FavoriteModule,
    RatingModule,
  ],


  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
