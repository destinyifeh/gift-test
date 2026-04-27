import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { GiftCardService } from './gift-card.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Request } from 'express';

@Controller('gift-cards')
export class GiftCardController {
  constructor(private readonly giftCardService: GiftCardService) {}

  // ── Public endpoints ──

  @Get()
  async findAll(
    @Query('country') country?: string,
    @Query('category') category?: string,
  ) {
    return this.giftCardService.findAll({ country, category });
  }

  @Get('categories')
  async getCategories() {
    return this.giftCardService.getCategories();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.giftCardService.findBySlug(slug);
  }

  // ── Admin endpoints ──

  @Get('admin/all')
  @UseGuards(AuthGuard, RolesGuard)
  async findAllAdmin(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.giftCardService.findAllAdmin({
      search, status, category,
      page: Number(page) || 1,
      limit: Number(limit) || 50,
    });
  }

  @Post('admin')
  @UseGuards(AuthGuard, RolesGuard)
  async create(@Body() data: any) {
    return this.giftCardService.create(data);
  }

  @Patch('admin/:id')
  @UseGuards(AuthGuard, RolesGuard)
  async update(@Param('id') id: string, @Body() data: any) {
    return this.giftCardService.update(Number(id), data);
  }

  @Delete('admin/:id')
  @UseGuards(AuthGuard, RolesGuard)
  async remove(@Param('id') id: string) {
    return this.giftCardService.remove(Number(id));
  }
}
