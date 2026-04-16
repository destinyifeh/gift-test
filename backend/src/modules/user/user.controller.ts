import { Controller, Get, Param, Patch, Delete, Body, Query, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query('page') page: string, @Query('limit') limit: string, @Query('search') search: string) {
    return this.userService.findAll(Number(page) || 1, Number(limit) || 10, search);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async findMe(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.userService.findMe(userId);
  }

  @Get(':idOrUsername')
  async findOne(@Param('idOrUsername') idOrUsername: string) {
    return this.userService.findOne(idOrUsername);
  }

  @UseGuards(AuthGuard)
  @Patch()
  async update(@Req() req: Request, @Body() updateData: UpdateUserDto) {
    const userId = (req as any).user.id;
    return this.userService.update(userId, updateData);
  }

  @UseGuards(AuthGuard)
  @Patch('creator-status')
  async updateCreatorStatus(@Req() req: Request, @Body('enabled') enabled: boolean) {
    const userId = (req as any).user.id;
    return this.userService.updateCreatorStatus(userId, enabled);
  }

  @UseGuards(AuthGuard)
  @Patch('banner')
  async updateBanner(@Req() req: Request, @Body('bannerUrl') bannerUrl: string) {
    const userId = (req as any).user.id;
    return this.userService.updateBannerImage(userId, bannerUrl);
  }

  @UseGuards(AuthGuard)
  @Patch('avatar')
  async updateAvatar(@Req() req: Request, @Body('avatarUrl') avatarUrl: string) {
    const userId = (req as any).user.id;
    return this.userService.updateAvatarImage(userId, avatarUrl);
  }

  @UseGuards(AuthGuard)
  @Delete('banner')
  async deleteBanner(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.userService.deleteBannerImage(userId);
  }

  @UseGuards(AuthGuard)
  @Delete('avatar')
  async deleteAvatar(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.userService.deleteAvatarImage(userId);
  }

  @UseGuards(AuthGuard)
  @Delete('me')
  async deleteOwnAccount(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.userService.deleteUser(userId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
