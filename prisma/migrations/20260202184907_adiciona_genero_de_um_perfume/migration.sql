-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('MASCULINO', 'FEMININO', 'UNISSEX');

-- AlterTable
ALTER TABLE "perfumes" ADD COLUMN     "genero" "Genero";
