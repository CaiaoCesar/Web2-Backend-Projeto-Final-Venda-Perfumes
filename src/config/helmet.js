import helmet from 'helmet';

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Permite estilos internos e de fontes/CDNs externos
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com", 
        "https://cdnjs.cloudflare.com"
      ],
      // Permite a execução dos scripts necessários para o Swagger funcionar
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://cdnjs.cloudflare.com"
      ],
      // Permite imagens locais, dados em base64 e o validador do Swagger
      imgSrc: ["'self'", "data:", "https://validator.swagger.io", "https:"],
      // Permite que o Swagger UI faça requisições para a sua própria API
      connectSrc: [
        "'self'", 
        "https://web2-backend-projeto-final-venda-pe.vercel.app", 
        "http://localhost:3000"
      ],
    },
  },

  // Mantém as demais proteções que você já configurou
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: process.env.NODE_ENV === 'production'
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

export default helmetConfig;
