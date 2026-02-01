/*
  Warnings:

  - You are about to drop the column `completed_at` on the `agenda_item` table. All the data in the column will be lost.
  - You are about to drop the column `is_unfinished` on the `agenda_item` table. All the data in the column will be lost.
  - You are about to drop the column `unfinished_at` on the `agenda_item` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "agenda_item_log_type" AS ENUM ('COMPLETED', 'UNCOMPLETED', 'MARKED_UNFINISHED', 'RESCHEDULED', 'CREATED', 'UPDATED', 'DELETED');

-- AlterTable
ALTER TABLE "agenda_item" DROP COLUMN "completed_at",
DROP COLUMN "is_unfinished",
DROP COLUMN "unfinished_at";

-- CreateTable
CREATE TABLE "agenda_item_log" (
    "id" TEXT NOT NULL,
    "agenda_item_id" TEXT NOT NULL,
    "type" "agenda_item_log_type" NOT NULL,
    "previous_value" JSONB,
    "new_value" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agenda_item_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agenda_item_log_agenda_item_id_idx" ON "agenda_item_log"("agenda_item_id");

-- CreateIndex
CREATE INDEX "agenda_item_log_type_idx" ON "agenda_item_log"("type");

-- CreateIndex
CREATE INDEX "agenda_item_log_created_at_idx" ON "agenda_item_log"("created_at");

-- AddForeignKey
ALTER TABLE "agenda_item_log" ADD CONSTRAINT "agenda_item_log_agenda_item_id_fkey" FOREIGN KEY ("agenda_item_id") REFERENCES "agenda_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
