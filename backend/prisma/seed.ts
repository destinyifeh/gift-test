import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { catalogData } from './seed-data';

// Try to load env manually if not present
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
}

console.log('DATABASE_URL from env:', process.env.DATABASE_URL ? 'FOUND' : 'NOT FOUND');

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('Starting seed...');

  console.log('Cleaning up old categories...');
  const activeCategoryNames = catalogData.map(c => c.name);
  const deleteResult = await prisma.productCategory.deleteMany({
    where: {
      name: {
        notIn: activeCategoryNames
      }
    }
  });
  console.log(`  Removed ${deleteResult.count} legacy categories.`);

  for (const cat of catalogData) {
    console.log(`Seeding category: ${cat.name}`);
    const category = await prisma.productCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        slug: slugify(cat.name),
      },
    });

    for (const sub of cat.subcategories) {
      console.log(`  Seeding subcategory: ${sub.name}`);
      const subcategory = await prisma.productSubcategory.upsert({
        where: {
          categoryId_name: {
            categoryId: category.id,
            name: sub.name,
          },
        },
        update: {},
        create: {
          categoryId: category.id,
          name: sub.name,
          slug: slugify(sub.name),
        },
      });

      for (const tagName of sub.tags) {
        console.log(`    Seeding tag: ${tagName}`);
        await prisma.productTag.upsert({
          where: {
            subcategoryId_name: {
              subcategoryId: subcategory.id,
              name: tagName,
            },
          },
          update: {},
          create: {
            subcategoryId: subcategory.id,
            name: tagName,
            slug: slugify(tagName),
          },
        });
      }
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
