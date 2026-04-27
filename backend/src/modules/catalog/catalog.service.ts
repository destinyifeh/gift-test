import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { catalogData } from '../../../prisma/seed-data';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(private prisma: PrismaService) {}

  async fetchHierarchy() {
    return this.prisma.productCategory.findMany({
      include: {
        subcategories: {
          include: {
            tags: true,
          },
        },
      },
    });
  }

  async seedCatalog() {
    this.logger.log('Starting catalog seeding...');
    
    for (const cat of catalogData) {
      const category = await this.prisma.productCategory.upsert({
        where: { slug: this.slugify(cat.name) },
        update: { name: cat.name },
        create: {
          name: cat.name,
          slug: this.slugify(cat.name),
        },
      });

      for (const sub of cat.subcategories) {
        const subcategory = await this.prisma.productSubcategory.upsert({
          where: {
            categoryId_slug: {
              categoryId: category.id,
              slug: this.slugify(sub.name),
            },
          },
          update: { name: sub.name },
          create: {
            name: sub.name,
            slug: this.slugify(sub.name),
            categoryId: category.id,
          },
        });

        for (const tagName of sub.tags) {
          await this.prisma.productTag.upsert({
            where: {
              subcategoryId_name: {
                subcategoryId: subcategory.id,
                name: tagName,
              },
            },
            update: {},
            create: {
              name: tagName,
              slug: this.slugify(tagName),
              subcategoryId: subcategory.id,
            },
          });
        }
      }
    }

    this.logger.log('Catalog seeding completed successfully.');
    return { success: true, message: 'Catalog seeded successfully' };
  }

  private slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  // Future CRUD methods for Admin
  async findAllCategories() {
    return this.prisma.productCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findSubcategories(categoryId: number) {
    return this.prisma.productSubcategory.findMany({
      where: { categoryId },
      orderBy: { name: 'asc' },
    });
  }

  async findTags(subcategoryId: number) {
    return this.prisma.productTag.findMany({
      where: { subcategoryId },
      orderBy: { name: 'asc' },
    });
  }

  // --- CRUD Admin ---
  async createCategory(name: string) {
    return this.prisma.productCategory.create({
      data: { name, slug: this.slugify(name) }
    });
  }

  async deleteCategory(id: number) {
    return this.prisma.productCategory.delete({ where: { id } });
  }

  async createSubcategory(categoryId: number, name: string) {
    return this.prisma.productSubcategory.create({
      data: { categoryId, name, slug: this.slugify(name) }
    });
  }

  async deleteSubcategory(id: number) {
    return this.prisma.productSubcategory.delete({ where: { id } });
  }

  async createTag(subcategoryId: number, name: string) {
    return this.prisma.productTag.create({
      data: { subcategoryId, name, slug: this.slugify(name) }
    });
  }

  async deleteTag(id: number) {
    return this.prisma.productTag.delete({ where: { id } });
  }

  // --- Tag Requests ---
  async createTagRequest(vendorId: string, subcategoryId: number, tagName: string, reason?: string) {
    return this.prisma.tagRequest.create({
      data: { vendorId, subcategoryId, tagName, adminNotes: reason, status: 'pending' }
    });
  }

  async getPendingTagRequests() {
    return this.prisma.tagRequest.findMany({
      where: { status: 'pending' },
      include: {
        vendor: { select: { username: true, displayName: true } },
        subcategory: { select: { name: true, category: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async resolveTagRequest(id: number, status: string, notes?: string) {
    const req = await this.prisma.tagRequest.update({
      where: { id },
      data: { status, adminNotes: notes }
    });
    
    // Auto-create tag if approved
    if (status === 'approved') {
      try {
        await this.createTag(req.subcategoryId, req.tagName);
      // eslint-disable-next-line no-empty
      } catch (e) {} // ignore unique constraint if exists
    }
    return req;
  }
}

