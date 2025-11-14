import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting conversion of Booking.userId to BigInt...');

  // Создаём временную таблицу с правильным типом
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS Booking_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId BIGINT NOT NULL,
      userName TEXT NOT NULL,
      userNick TEXT,
      trainingId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trainingId) REFERENCES CrossfitTraining(id) ON DELETE CASCADE
    );
  `);

  console.log('Temporary table Booking_new created.');

  // Копируем данные из старой таблицы
  await prisma.$executeRawUnsafe(`
    INSERT INTO Booking_new (id, userId, userName, userNick, trainingId, createdAt)
    SELECT id, userId, userName, userNick, trainingId, createdAt
    FROM Booking;
  `);

  console.log('Data copied to Booking_new.');

  // Удаляем старую таблицу
  await prisma.$executeRawUnsafe(`DROP TABLE Booking;`);
  console.log('Old Booking table dropped.');

  // Переименовываем новую таблицу
  await prisma.$executeRawUnsafe(`ALTER TABLE Booking_new RENAME TO Booking;`);
  console.log('Booking_new renamed to Booking.');

  console.log('Conversion completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
