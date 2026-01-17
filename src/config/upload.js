//Upload de imagem
import multer from 'multer';

import path from 'path';

const url = await uploadcare.upload(file); 

await dd.perfume.update({ foto: url });