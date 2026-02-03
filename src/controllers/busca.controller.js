import * as buscaService from '../services/busca.service.js';
import * as buscaSchema from '../schemas/busca.schema.js';

export const buscarPerfumes = async (req, res, next) => {
  try {
    // Validação dos dados de entrada (query params)
    const filtrosValidados = buscaSchema.esquemaListagemPerfumes.parse(req.query);

    // Chamada ao serviço
    const resultado = await buscaService.buscarPerfumes(filtrosValidados);

    return res.status(200).json({
      status: 'sucesso',
      dados: resultado
    });

  } catch (error) {
    next(error);
  }
};

export default {
  buscarPerfumes,
};
