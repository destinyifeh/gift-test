import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { paginate, getPaginationOptions } from '../../common/utils/pagination.util';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(vendorId: string, data: CreateProductDto) {
    const isVendor = await (this.prisma as any).user.findFirst({
      where: { id: vendorId, roles: { has: 'vendor' } }
    });

    if (!isVendor) {
      throw new BadRequestException('User is not authorized as a vendor');
    }

    return (this.prisma as any).$transaction(async (tx: any) => {
      const { images, ...productData } = data;
      
      const product = await (tx as any).vendorGift.create({
        data: {
          ...productData,
          vendorId,
          price: productData.price ? Number(productData.price) : 0,
        },
      });

      if (images && images.length > 0) {
        await (tx as any).vendorGiftImage.createMany({
          data: images.map((url, i) => ({
            giftId: product.id,
            url: url,
          }))
        });
      }

      return product;
    });
  }

  async findAll(page: number = 1, limit: number = 20, vendorId?: string) {
    const { skip, take } = getPaginationOptions(page, limit);

    const where = vendorId ? { vendorId, status: 'active' } : { status: 'active' };

    const [products, total] = await Promise.all([
      (this.prisma as any).vendorGift.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: { select: { businessName: true, businessSlug: true } },
          giftImages: true
        }
      }),
      (this.prisma as any).vendorGift.count({ where })
    ]);

    const formatted = products.map((p: any) => ({
      ...p,
      price: p.price.toString()
    }));

    return paginate(formatted, total, page, limit);
  }

  async findOne(id: number) {
    const product = await (this.prisma as any).vendorGift.findUnique({
      where: { id },
      include: {
        vendor: { select: { businessName: true, businessSlug: true, avatarUrl: true } },
        giftImages: true
      }
    });

    if (!product) throw new NotFoundException('Product not found');

    return {
      ...product,
      price: product.price.toString()
    };
  }

  async setStatus(vendorId: string, id: number, status: string) {
    const product = await (this.prisma as any).vendorGift.findUnique({ where: { id } });

    if (!product) throw new NotFoundException('Product not found');
    if (product.vendorId !== vendorId) throw new BadRequestException('Unauthorized');

    return (this.prisma as any).vendorGift.update({
      where: { id },
      data: { status }
    });
  }
}
