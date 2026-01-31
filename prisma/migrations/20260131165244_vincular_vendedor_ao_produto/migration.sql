/*
  Warnings:

  - Added the required column `vendedor_id` to the `perfumes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "perfumes" ADD COLUMN     "vendedor_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "perfumes" ADD CONSTRAINT "perfumes_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "vendedores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
