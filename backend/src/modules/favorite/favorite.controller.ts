import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('favorites')
@UseGuards(AuthGuard)
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post('toggle/:productId')
  async toggle(@Req() req: any, @Param('productId') productId: string) {
    return this.favoriteService.toggle(req.user.id, Number(productId));
  }

  @Get()
  async fetchFavorites(@Req() req: any) {
    const data = await this.favoriteService.fetchUserFavorites(req.user.id);
    return { success: true, data };
  }

  @Get('check/:productId')
  async checkIsFavorited(@Req() req: any, @Param('productId') productId: string) {
    const favorited = await this.favoriteService.checkIsFavorited(req.user.id, Number(productId));
    return { favorited };
  }
}
