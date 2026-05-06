import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @UseGuards(AuthGuard)
  @Post('toggle')
  async toggle(@Req() req: any, @Body('giftCardId') giftCardId: number) {
    return this.favoriteService.toggleFavorite(req.user.id, giftCardId);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getFavorites(@Req() req: any) {
    return this.favoriteService.getUserFavorites(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('is-favorited/:giftCardId')
  async isFavorited(@Req() req: any, @Param('giftCardId') giftCardId: string) {
    return this.favoriteService.isFavorited(req.user.id, Number(giftCardId));
  }
}
