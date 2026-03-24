/*
  Warnings:

  - You are about to drop the column `userId` on the `bookings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerId` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `customers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_userId_fkey";

-- DropIndex
DROP INDEX "bookings_userId_idx";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "userId",
ADD COLUMN     "customerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "bookings_customerId_idx" ON "bookings"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE INDEX "idx_customer_email" ON "customers"("email");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
