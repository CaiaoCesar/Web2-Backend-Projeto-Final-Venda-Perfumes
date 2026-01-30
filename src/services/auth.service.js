import bcrypt from 'bcryptjs/dist/bcrypt.js';
import prisma from '../config/database.js'; 

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

    const saltos = Number(process.env.SALTS_BYCRIPT) || 10

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

export default {
    vendedorExiste,
    criarVendedor,
}
