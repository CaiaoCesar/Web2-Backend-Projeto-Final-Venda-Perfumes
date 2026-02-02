// tests/unit/upload.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import upload from '../../src/config/upload.js'; // Seu arquivo de config

// ---------------------------------------------------
// 🛠️ SETUP DO AMBIENTE DE TESTE
// ---------------------------------------------------
// Criamos um app Express falso apenas para testar esse middleware
const app = express();

// Rota de teste usando a configuração do multer
app.post('/test-upload', upload.single('arquivo'), (req, res) => {
  // Se passou pelo multer, deu sucesso
  res.status(200).json({ success: true, file: req.file });
});

// Middleware de Erro (Simula o tratamento de erro global da sua app)
app.use((err, req, res, next) => {
  // Erro do seu AppError (FileFilter)
  if (err.statusCode) {
    return res.status(err.statusCode).json({ 
      success: false, 
      message: err.message 
    });
  }

  // Erro nativo do Multer (Tamanho do arquivo)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      success: false, 
      message: 'Arquivo muito grande. Limite é 5MB.' 
    });
  }

  res.status(500).json({ error: 'Erro interno' });
});

// ---------------------------------------------------
// 🧪 INÍCIO DOS TESTES
// ---------------------------------------------------
describe('📸 Upload Middleware (Multer) - Testes de Configuração', () => {
  
  // ==========================================
  // EXTENSÕES PERMITIDAS
  // ==========================================
  describe('Tipos de Arquivo (MIME Types)', () => {
    
    it('deve ACEITAR imagem PNG', async () => {
      // Buffer.from('') cria um arquivo falso em memória
      const response = await request(app)
        .post('/test-upload')
        .attach('arquivo', Buffer.from('fake-image-content'), 'teste.png')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.file.mimetype).toBe('image/png');
    });

    it('deve ACEITAR imagem JPEG/JPG', async () => {
      const response = await request(app)
        .post('/test-upload')
        .attach('arquivo', Buffer.from('fake'), 'foto.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.file.mimetype).toBe('image/jpeg');
    });

    it('deve ACEITAR imagem WEBP', async () => {
      const response = await request(app)
        .post('/test-upload')
        .attach('arquivo', Buffer.from('fake'), 'imagem.webp')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('deve REJEITAR arquivo PDF (AppError 400)', async () => {
      const response = await request(app)
        .post('/test-upload')
        .attach('arquivo', Buffer.from('fake-pdf'), 'documento.pdf') // .pdf
        .expect(400);

      expect(response.body.success).toBe(false);
      // Verifica se a mensagem é exatamente a que você definiu no AppError
      expect(response.body.message).toContain('Formato de arquivo inválido');
    });

    it('deve REJEITAR arquivo de texto (.txt)', async () => {
      const response = await request(app)
        .post('/test-upload')
        .attach('arquivo', Buffer.from('texto'), 'nota.txt')
        .expect(400);

      expect(response.body.message).toContain('Apenas imagens são permitidas');
    });

    it('deve REJEITAR executável (.exe)', async () => {
      const response = await request(app)
        .post('/test-upload')
        .attach('arquivo', Buffer.from('virus'), 'virus.exe')
        .expect(400);
        
      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // LIMITE DE TAMANHO (5MB)
  // ==========================================
  describe('Limite de Tamanho (Size Limit)', () => {
    
    it('deve ACEITAR arquivo de 4MB (dentro do limite)', async () => {
      // Cria um buffer de 4MB
      const bufferGrande = Buffer.alloc(4 * 1024 * 1024); 
      
      const response = await request(app)
        .post('/test-upload')
        .attach('arquivo', bufferGrande, 'grande.png')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('deve REJEITAR arquivo de 6MB (acima do limite)', async () => {
      // Cria um buffer de 6MB (seu limite é 5MB)
      const bufferGigante = Buffer.alloc(6 * 1024 * 1024);

      const response = await request(app)
        .post('/test-upload')
        .attach('arquivo', bufferGigante, 'gigante.png')
        .expect(400); // O middleware de erro pega o erro LIMIT_FILE_SIZE

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('grande');
    });
  });

});