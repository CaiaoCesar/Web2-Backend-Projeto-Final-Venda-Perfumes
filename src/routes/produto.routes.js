import { Router } from 'express';

import {
  criarPerfume,
  listarPerfumes,
  editarPerfume,
  editarEstoquePerfume,
  deletarPerfume,
} from '../controllers/produto.controller.js';

const router = Router();

router.post('/', criarPerfume);
router.get('/', listarPerfumes);
router.put('/:id', editarPerfume);
router.put('/estoque/:id', editarEstoquePerfume);
router.delete('/:id', deletarPerfume);

export default router;
