import { prisma } from "../database/prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTRO DE VENDEDOR
export const registerVendedor = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    // Verifica se o email já existe
    const existing = await prisma.vendedor.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email já cadastrado" });

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Cria o vendedor
    const vendedor = await prisma.vendedor.create({
      data: { nome, email, senha: hashedPassword }
    });

    return res.status(201).json({ vendedor });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao registrar vendedor" });
  }
};

// LOGIN DE VENDEDOR
export const loginVendedor = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Verifica se existe
    const vendedor = await prisma.vendedor.findUnique({ where: { email } });
    if (!vendedor) return res.status(400).json({ message: "Email ou senha inválidos" });

    // Confere senha
    const isValid = await bcrypt.compare(senha, vendedor.senha);
    if (!isValid) return res.status(400).json({ message: "Email ou senha inválidos" });

    // Gera JWT
    const token = jwt.sign(
      { id: vendedor.id, email: vendedor.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({ vendedor, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao fazer login" });
  }
};