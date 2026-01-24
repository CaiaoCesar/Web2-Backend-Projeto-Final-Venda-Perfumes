/*
  Warnings:

  - The values [PREPARACAO,CANCELADO,ENVIADO,ENTREGUE] on the enum `StatusPedido` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `perfumes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `perfumes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `cidade` to the `administradores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `administradores` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `perfume_id` on the `pedido_itens` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `foto` on table `perfumes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `descricao` on table `perfumes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `frasco` on table `perfumes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusPedido_new" AS ENUM ('PENDENTE', 'CONFIRMADO');
ALTER TABLE "public"."pedidos" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "pedidos" ALTER COLUMN "status" TYPE "StatusPedido_new" USING ("status"::text::"StatusPedido_new");
ALTER TYPE "StatusPedido" RENAME TO "StatusPedido_old";
ALTER TYPE "StatusPedido_new" RENAME TO "StatusPedido";
DROP TYPE "public"."StatusPedido_old";
ALTER TABLE "pedidos" ALTER COLUMN "status" SET DEFAULT 'PENDENTE';
COMMIT;

-- DropForeignKey
ALTER TABLE "pedido_itens" DROP CONSTRAINT "pedido_itens_perfume_id_fkey";

-- AlterTable
ALTER TABLE "administradores" ADD COLUMN     "cidade" TEXT NOT NULL,
ADD COLUMN     "estado" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "pedido_itens" DROP COLUMN "perfume_id",
ADD COLUMN     "perfume_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "perfumes" DROP CONSTRAINT "perfumes_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "foto" SET NOT NULL,
ALTER COLUMN "descricao" SET NOT NULL,
ALTER COLUMN "frasco" SET NOT NULL,
ADD CONSTRAINT "perfumes_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "pedido_itens_perfume_id_pedido_id_key" ON "pedido_itens"("perfume_id", "pedido_id");

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_perfume_id_fkey" FOREIGN KEY ("perfume_id") REFERENCES "perfumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
