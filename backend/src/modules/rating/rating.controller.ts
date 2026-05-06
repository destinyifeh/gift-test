import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RatingService } from './rating.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @UseGuards(AuthGuard)
  @Post('vendor')
  async rateVendor(
    @Req() req: any,
    @Body() data: { vendorId: string; rating: number; comment?: string },
  ) {
    return this.ratingService.submitVendorRating(req.user.id, data.vendorId, data.rating, data.comment);
  }

  @Get('vendor/:vendorId')
  async getVendorRating(@Param('vendorId') vendorId: string) {
    return this.ratingService.getVendorRating(vendorId);
  }
}
