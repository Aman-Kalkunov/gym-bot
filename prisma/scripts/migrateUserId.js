import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`ALTER TABLE crossfitTraining ADD COLUMN userId_bigint INTEGER;`;
  await prisma.$executeRaw`UPDATE crossfitTraining SET userId_bigint = userId;`;
  console.log('Колонка userId_bigint добавлена и скопированы данные');
}

main().finally(() => prisma.$disconnect());
