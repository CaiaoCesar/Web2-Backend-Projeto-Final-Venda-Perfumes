// Aqui o multer é configurado para upload de imagens
import multer from 'multer';
import { AppError } from '../utils/appError.js';

const storage = multer.memoryStorage();

// Função que filtra os tipos de arquivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Formato de arquivo inválido. Apenas imagens são permitidas (JPEG, JPG, PNG, WEBP, GIF).',
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;
