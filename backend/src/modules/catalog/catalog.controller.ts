import { Controller, Get, Post, Put, Delete, Param, ParseIntPipe, UseGuards, Body, Req } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';


@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('hierarchy')
  async getHierarchy() {
    return this.catalogService.fetchHierarchy();
  }

  @Get('categories')
  async getCategories() {
    return this.catalogService.findAllCategories();
  }

  @Get('categories/:id/subcategories')
  async getSubcategories(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.findSubcategories(id);
  }

  @Get('subcategories/:id/tags')
  async getTags(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.findTags(id);
  }

  // Admin seeding endpoint
  @Post('admin/seed')
  async seed() {
    return this.catalogService.seedCatalog();
  }

  // --- Admin CRUD ---
  @Post('categories')
  @UseGuards(AuthGuard, RolesGuard)
  async createCategory(@Body('name') name: string) {
    return this.catalogService.createCategory(name);
  }

  @Delete('categories/:id')
  @UseGuards(AuthGuard, RolesGuard)
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deleteCategory(id);
  }

  @Post('categories/:categoryId/subcategories')
  @UseGuards(AuthGuard, RolesGuard)
  async createSubcategory(@Param('categoryId', ParseIntPipe) categoryId: number, @Body('name') name: string) {
    return this.catalogService.createSubcategory(categoryId, name);
  }

  @Delete('subcategories/:id')
  @UseGuards(AuthGuard, RolesGuard)
  async deleteSubcategory(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deleteSubcategory(id);
  }

  @Post('subcategories/:subcategoryId/tags')
  @UseGuards(AuthGuard, RolesGuard)
  async createTag(@Param('subcategoryId', ParseIntPipe) subcategoryId: number, @Body('name') name: string) {
    return this.catalogService.createTag(subcategoryId, name);
  }

  @Delete('tags/:id')
  @UseGuards(AuthGuard, RolesGuard)
  async deleteTag(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deleteTag(id);
  }

  // --- Tag Requests ---
  @Post('requests')
  @UseGuards(AuthGuard) 
  async createTagRequest(@Req() req: any, @Body() data: any) {
    return this.catalogService.createTagRequest(req.user.sub, data.subcategoryId, data.requestedName, data.reason);
  }

  @Get('requests')
  @UseGuards(AuthGuard, RolesGuard)
  async getTagRequests() {
    return this.catalogService.getPendingTagRequests();
  }

  @Put('requests/:id/resolve')
  @UseGuards(AuthGuard, RolesGuard)
  async resolveTagRequest(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogService.resolveTagRequest(id, data.status, data.adminNotes);
  }
}

