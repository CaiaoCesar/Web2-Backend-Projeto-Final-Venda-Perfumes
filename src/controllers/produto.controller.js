import prisma from "../config/database.js";

export const criaPerfume = async (req, res) => {
    try {
        const  {nome, marca, preco } = req.body;    
        if (!nome || !marca || !preco) {
            return res.status(400).json({ message: 'Todos os campos devem ser preenchidos' });
        }
    
    const perfumeExistente = await prisma.perfume.findFirst({
        where : {nome},
    }); 

    if (perfumeExistente) {
        return res.status(400).json({ message: 'Ja existe um perfume com esse nome' });
    }

    const novoPerfume = await prisma.perfume.create ({
        data: {
            nome,
            marca,
            preco,
        },
    });

    res.status(201).json ({
        message: "Perfume criado com sucesso!",
        produto: novoPerfume,
    });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const listarPerfumes = async (req, res) => {
    try {
        const perfumes = await prisma.perfume.findMany();
        res.status(200).json({ message: "Perfumes listados com sucesso!", perfumes });
    } catch (error) {
        return res.status(500).json({ message:"Ocorreu um erro ao listar perfumes!", error:error.message });
    }
};

export const editarPerfume = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, marca, preco } = req.body;

        await prisma.perfume.update({
            where: { id: parseInt(id) },
            data: {
                nome, 
                marca,
                foto,
                preco, 
                descricao,
                frasco,
            },
        });

        res.status(200).json({ message: "Perfume atualizado com sucesso!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


