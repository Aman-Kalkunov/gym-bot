-- CreateTable
CREATE TABLE "CrossfitTraining" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "booked" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" BIGINT NOT NULL,
    "userName" TEXT NOT NULL,
    "userNick" TEXT,
    "trainingId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "CrossfitTraining" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
