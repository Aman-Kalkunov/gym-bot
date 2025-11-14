import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function main() {
  console.log('Начинаем очистку Booking с некорректными userId...');

  // Находим все проблемные Booking (userId слишком большой для старого INT)
  const badBookings = await prisma.booking.findMany({
    where: {
      userId: {
        gt: 2147483647, // INT max
      },
    },
    select: {
      id: true,
      trainingId: true,
    },
  });

  console.log(`Найдено ${badBookings.length} проблемных записей`);

  if (badBookings.length > 0) {
    // Группируем по trainingId, чтобы корректно уменьшить booked
    const trainingCounts = {};
    for (const b of badBookings) {
      trainingCounts[b.trainingId] = (trainingCounts[b.trainingId] || 0) + 1;
    }

    // Обновляем booked у тренировок
    for (const [trainingIdStr, count] of Object.entries(trainingCounts)) {
      const trainingId = Number(trainingIdStr);
      await prisma.crossfitTraining.update({
        where: { id: trainingId },
        data: {
          booked: {
            decrement: count,
          },
        },
      });
      console.log(`Обновили CrossfitTraining id=${trainingId}, уменьшили booked на ${count}`);
    }

    // Удаляем проблемные Booking
    const badBookingIds = badBookings.map(b => b.id);
    await prisma.booking.deleteMany({
      where: {
        id: { in: badBookingIds },
      },
    });

    console.log('Удалили проблемные записи из Booking');
  } else {
    console.log('Проблемных записей нет');
  }

  // Удаляем userId_bigint из CrossfitTraining
  console.log('Удаляем колонку userId_bigint из CrossfitTraining...');
  try {
    execSync(`sqlite3 ./prisma/dev.db "ALTER TABLE CrossfitTraining DROP COLUMN userId_bigint;"`);
    console.log('Колонка userId_bigint удалена');
  } catch (e) {
    console.warn(
      'Удаление userId_bigint через SQLite не поддерживается напрямую, можно оставить колонку, она больше не используется',
    );
  }

  console.log('Очистка завершена');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
