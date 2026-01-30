import prisma from "../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import * as authService from "../services/auth.service.js";

/**
 * Controller de autentificação de vendedores
 * Responsável por gerenciar requisições HTTP relacionadas aos vendedores
 * Delega a lógica de negócio para o authService
 */

/**
 * POST /api/v2/vendedores
 * Cria um novo vendedor
 */
export const registrarVendedor = async (req, res, next) => {
  try {
    // req.file é populado pelo multer quando há upload
    const novoVendedor = await authService.criarVendedor(req.body);

    res.status(201).json({
      success: true,
      message: 'Vendedor registrado com sucesso!',
      data: novoVendedor,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// LOGIN DE VENDEDOR
export const loginVendedor = async (req, res) => {
  const novoLogin = await authService.criarVendedor(req.body);

  try {
    // Verifica se existe
    console.log("Entrou aqui");
    const vendedor = await prisma.vendedor.findUnique({ where: { email } });
    if (!vendedor) return res.status(400).json({ message: "Email ou senha inválidos" });

    // Confere senha
    const isValid = await bcrypt.compare(senha, vendedor.senha);
    if (!isValid) return res.status(400).json({ message: "Email ou senha inválidos" });

    console.log("Usuario logou com sucesso");
    // Gera JWT
    /*
    const token = jwt.sign(
      { id: vendedor.id, email: vendedor.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.EXPIRATION_TIME }
    );
*/

    return res.json({ vendedor, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao fazer login" });
  }
};

export default {
  registrarVendedor,
  loginVendedor,
};