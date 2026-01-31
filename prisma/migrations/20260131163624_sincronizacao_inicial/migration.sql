-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('PENDENTE', 'CONFIRMADO');

-- CreateTable
CREATE TABLE "vendedores" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "nome_loja" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfumes" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "quantidade_estoque" INTEGER NOT NULL DEFAULT 0,
    "foto" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT NOT NULL,
    "frasco" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "valor_total" DOUBLE PRECISION NOT NULL,
    "nome_cliente" TEXT NOT NULL,
    "telefone_cliente" TEXT NOT NULL,
    "status" "StatusPedido" NOT NULL DEFAULT 'PENDENTE',
    "data_pedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vendedor_id" INTEGER NOT NULL,
    "mensagem_whatsapp" TEXT,
    "enviado_whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_itens" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "preco_unitario" DOUBLE PRECISION NOT NULL,
    "perfume_id" INTEGER NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_itens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendedores_email_key" ON "vendedores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pedido_itens_perfume_id_pedido_id_key" ON "pedido_itens"("perfume_id", "pedido_id");

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "vendedores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_perfume_id_fkey" FOREIGN KEY ("perfume_id") REFERENCES "perfumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
