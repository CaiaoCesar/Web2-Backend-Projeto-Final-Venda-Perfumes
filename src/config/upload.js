// src/config/upload.js
import multer from 'multer';

/**
 * Configuração do Multer para upload em memória
 * Os arquivos serão armazenados temporariamente no buffer
 * para serem enviados ao Uploadcare
 */

// Configuração de armazenamento em memória
const storage = multer.memoryStorage();

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  // Tipos MIME permitidos
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo inválido. Apenas imagens são permitidas (JPEG, PNG, WEBP, GIF).'), false);
  }
};

// Configuração do Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
  },
});

export default upload;