/*
  Warnings:

  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `ticketId` on the `Work` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `User` table. All the data in the column will be lost.
  - Added the required column `channelId` to the `Work` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `Work` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Work` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Work` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Work` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Ticket_id_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Ticket";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Work" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "supervisorId" TEXT,
    "workerId" TEXT,
    "messageId" TEXT,
    "channelId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "price" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Work_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Work_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Work_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Work" ("createdAt", "id", "isCompleted", "price", "updatedAt") SELECT "createdAt", "id", "isCompleted", "price", "updatedAt" FROM "Work";
DROP TABLE "Work";
ALTER TABLE "new_Work" RENAME TO "Work";
CREATE UNIQUE INDEX "Work_id_key" ON "Work"("id");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "balanceUSD" INTEGER NOT NULL DEFAULT 0,
    "balanceOSRS" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("createdAt", "discordId", "id", "updatedAt") SELECT "createdAt", "discordId", "id", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
