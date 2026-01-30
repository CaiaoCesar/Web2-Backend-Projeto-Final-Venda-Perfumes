import bcrypt from 'bcryptjs/dist/bcrypt.js';
import prisma from '../config/database.js'; 
import jwt from 'jsonwebtoken';

// Verfica se o vendedor existe pelo email
export const vendedorExiste = async (email) => {
    const vendedor = await prisma.vendedor.findFirst({
        where: { email: email}, 
    });
    return !!vendedor; 
};

// Cria um novo vendedor
export const criarVendedor = async (vendedorDados) => {
    const verificaVendedorExiste = await vendedorExiste(vendedorDados.email);
    if (verificaVendedorExiste) {
        throw new Error('Existe um Vendedor com este email já registrado'); 
    }

    const saltos = Number(process.env.SALTS_BYCRIPT) || 10;

    const senhaCriptografada = await bcrypt.hash(vendedorDados.senha, saltos);
    return await prisma.vendedor.create({
        data: {
            nome: vendedorDados.nome,
            email: vendedorDados.email,
            senha: senhaCriptografada,
            telefone: vendedorDados.telefone,
            estado: vendedorDados.estado,
            cidade: vendedorDados.cidade,
        },
        select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            estado: true,
            cidade: true,
        },
    });

};

// Validação do usuário e criação do token de acesso (JWT)
export const autenticarVendedor = async (email, senha) => {
    // Busca vendedor através do email
    const vendedor = await prisma.vendedor.findUnique({ where : { email }});
    // Verifica se o vendedor existe
    if (!vendedor) throw new Error("Credenciais inválidas");

  // 2. Valida a senha
  const senhaValida = await bcrypt.compare(senha, vendedor.senha);
  // Se a senha não for a senha correta, apresenta erro
  if (senhaValida === false) throw new Error("Credenciais inválidas");

  // 3. Gera o Token
  const token = jwt.sign(
    { id: vendedor.id, email: vendedor.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.EXPIRATION_TIME || '5h' }
  );

  return { vendedor, token };  

}

export default {
    vendedorExiste,
    criarVendedor,
}
