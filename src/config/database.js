// Arquivo que configura a conexão do bd com o prisma 
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default prisma;
