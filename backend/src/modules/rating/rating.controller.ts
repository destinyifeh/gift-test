import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RatingService } from './rating.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @UseGuards(AuthGuard)
  @Post('voucher')
  async rateVoucher(
    @Req() req: any,
    @Body('campaignId') campaignId: string,
    @Body('rating') rating: number,
  ) {
    return this.ratingService.rateVoucherGift(req.user.id, campaignId, rating);
  }

  @UseGuards(AuthGuard)
  @Post('support')
  async rateSupport(
    @Req() req: any,
    @Body('supportId') supportId: string,
    @Body('rating') rating: number,
  ) {
    return this.ratingService.rateSupportGift(req.user.id, supportId, rating);
  }

  @Get('vendor/:vendorId')
  async getVendorStats(@Param('vendorId') vendorId: string) {
    return this.ratingService.getVendorRatingStats(vendorId);
  }
}
