/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `task_number` to the `task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "project" ADD COLUMN     "task_counter" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "task" ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "task_number" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "project_slug_key" ON "project"("slug");

-- CreateIndex
CREATE INDEX "task_slug_idx" ON "task"("slug");
