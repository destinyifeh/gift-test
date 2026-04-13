import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { Request } from 'express';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(@Query('page') page: string, @Query('limit') limit: string, @Query('vendorId') vendorId: string) {
    return this.productService.findAll(Number(page) || 1, Number(limit) || 20, vendorId);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@Req() req: Request, @Body() data: CreateProductDto) {
    const vendorId = (req as any).user.id;
    return this.productService.create(vendorId, data);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/status')
  async setStatus(@Req() req: Request, @Param('id', ParseIntPipe) id: number, @Body('status') status: string) {
    const vendorId = (req as any).user.id;
    return this.productService.setStatus(vendorId, id, status);
  }
}
