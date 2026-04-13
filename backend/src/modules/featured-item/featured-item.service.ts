import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FeaturedItemService {
  constructor(private prisma: PrismaService) {}

  async fetchAll() {
    return (this.prisma as any).featuredItem.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async fetchByPlacement(type: string) {
    return (this.prisma as any).featuredItem.findMany({
      where: { isActive: true, type },
      orderBy: { order: 'asc' },
    });
  }

  async create(data: {
    title?: string;
    description?: string;
    imageUrl?: string;
    link?: string;
    type: string;
    order?: number;
    metadata?: any;
  }) {
    return (this.prisma as any).featuredItem.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        link: data.link,
        type: data.type,
        order: data.order || 0,
        metadata: data.metadata || {},
      },
    });
  }

  async update(id: number, data: Record<string, any>) {
    const item = await (this.prisma as any).featuredItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Featured item not found');
    return (this.prisma as any).featuredItem.update({ where: { id }, data });
  }

  async delete(id: number) {
    return (this.prisma as any).featuredItem.delete({ where: { id } });
  }
}
