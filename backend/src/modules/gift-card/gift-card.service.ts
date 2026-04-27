import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';

@Injectable()
export class GiftCardService {
  constructor(private prisma: PrismaService) {}

  // ── Public ──

  async findAll(options: { country?: string; category?: string } = {}) {
    const where: any = { status: 'active' };
    if (options.country) where.OR = [{ country: options.country }, { country: null }];
    if (options.category) where.category = options.category;

    const cards = await (this.prisma as any).giftCard.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });

    return cards.map((c: any) => ({
      ...c,
      minAmount: c.minAmount.toString(),
      maxAmount: c.maxAmount.toString(),
      serviceFeePercent: c.serviceFeePercent.toString(),
    }));
  }

  async findBySlug(slug: string) {
    const card = await (this.prisma as any).giftCard.findUnique({ where: { slug } });
    if (!card) throw new NotFoundException('Gift card not found');
    return {
      ...card,
      minAmount: card.minAmount.toString(),
      maxAmount: card.maxAmount.toString(),
      serviceFeePercent: card.serviceFeePercent.toString(),
    };
  }

  async getCategories() {
    const cards = await (this.prisma as any).giftCard.findMany({
      where: { status: 'active' },
      select: { category: true },
      distinct: ['category'],
    });
    return cards.map((c: any) => c.category);
  }

  // ── Admin ──

  async findAllAdmin(options: { search?: string; status?: string; category?: string; page?: number; limit?: number }) {
    const { search, status, category, page = 1, limit = 50 } = options;
    const { skip, take } = getPaginationOptions(page, limit);

    const where: any = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    if (category) where.category = category;

    const [cards, total] = await Promise.all([
      (this.prisma as any).giftCard.findMany({
        where, skip, take,
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      }),
      (this.prisma as any).giftCard.count({ where }),
    ]);

    const formatted = cards.map((c: any) => ({
      ...c,
      minAmount: c.minAmount.toString(),
      maxAmount: c.maxAmount.toString(),
      serviceFeePercent: c.serviceFeePercent.toString(),
    }));

    return paginate(formatted, total, page, limit);
  }

  async create(data: any) {
    const card = await (this.prisma as any).giftCard.create({ data });
    return { ...card, minAmount: card.minAmount.toString(), maxAmount: card.maxAmount.toString(), serviceFeePercent: card.serviceFeePercent.toString() };
  }

  async update(id: number, data: any) {
    delete data.id;
    const card = await (this.prisma as any).giftCard.update({ where: { id }, data });
    return { ...card, minAmount: card.minAmount.toString(), maxAmount: card.maxAmount.toString(), serviceFeePercent: card.serviceFeePercent.toString() };
  }

  async remove(id: number) {
    return (this.prisma as any).giftCard.update({ where: { id }, data: { status: 'archived' } });
  }
}
