/*
  Warnings:

  - The primary key for the `expenses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dateId` on the `expenses` table. All the data in the column will be lost.
  - Added the required column `date` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_dateId_fkey";

-- AlterTable
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_pkey",
DROP COLUMN "dateId",
ADD COLUMN     "date" DATE NOT NULL,
ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("date");
