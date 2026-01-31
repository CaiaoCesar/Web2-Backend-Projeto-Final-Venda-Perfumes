import app from './app.js';
import dotenv from 'dotenv';
import helmetConfig from './config/helmet.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(helmetConfig);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`Perfumes: http://localhost:${PORT}/api/v2/perfumes\n`);
});
