/*
  Warnings:

  - The values [PERSONAL,WORK,STUDY,PROJECT] on the enum `note_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "note_type_new" AS ENUM ('GENERAL', 'MEETING', 'DAILY', 'TASK');
ALTER TABLE "public"."note" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "note" ALTER COLUMN "type" TYPE "note_type_new" USING ("type"::text::"note_type_new");
ALTER TYPE "note_type" RENAME TO "note_type_old";
ALTER TYPE "note_type_new" RENAME TO "note_type";
DROP TYPE "public"."note_type_old";
ALTER TABLE "note" ALTER COLUMN "type" SET DEFAULT 'GENERAL';
COMMIT;

-- AlterTable
ALTER TABLE "note" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "type" SET DEFAULT 'GENERAL';

-- CreateTable
CREATE TABLE "_BoardToNote" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BoardToNote_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_NoteToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NoteToProject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_NoteToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NoteToTask_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BoardToNote_B_index" ON "_BoardToNote"("B");

-- CreateIndex
CREATE INDEX "_NoteToProject_B_index" ON "_NoteToProject"("B");

-- CreateIndex
CREATE INDEX "_NoteToTask_B_index" ON "_NoteToTask"("B");

-- AddForeignKey
ALTER TABLE "_BoardToNote" ADD CONSTRAINT "_BoardToNote_A_fkey" FOREIGN KEY ("A") REFERENCES "boad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoardToNote" ADD CONSTRAINT "_BoardToNote_B_fkey" FOREIGN KEY ("B") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteToProject" ADD CONSTRAINT "_NoteToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteToProject" ADD CONSTRAINT "_NoteToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteToTask" ADD CONSTRAINT "_NoteToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteToTask" ADD CONSTRAINT "_NoteToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
