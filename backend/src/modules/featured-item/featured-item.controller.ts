import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { FeaturedItemService } from './featured-item.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('featured-items')
export class FeaturedItemController {
  constructor(private readonly featuredItemService: FeaturedItemService) {}

  // Public
  @Get('placement/:placement')
  async fetchByPlacement(@Param('placement') placement: string) {
    const data = await this.featuredItemService.fetchByPlacement(placement);
    return { success: true, data };
  }

  // Admin
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get()
  async fetchAll() {
    const data = await this.featuredItemService.fetchAll();
    return { success: true, data };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post()
  async create(@Req() req: any, @Body() data: any) {
    const item = await this.featuredItemService.create(data);
    return { success: true, data: item };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    const item = await this.featuredItemService.update(Number(id), data);
    return { success: true, data: item };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.featuredItemService.delete(Number(id));
    return { success: true };
  }
}
