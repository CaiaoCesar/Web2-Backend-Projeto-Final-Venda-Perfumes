import helmet from 'helmet';

/**
 * Configuração do Helmet para headers de segurança HTTP
 *
 * Helmet ajuda a proteger a aplicação configurando vários headers HTTP.
 * Documentação: https://helmetjs.github.io/
 */
const helmetConfig = helmet({
  // Content Security Policy - define fontes confiáveis de conteúdo
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Necessário para Swagger UI
      scriptSrc: ["'self'", "'unsafe-inline'"], // Necessário para Swagger UI
      imgSrc: ["'self'", "data:", "https:"],
    },
  },

  // Cross-Origin-Embedder-Policy - desabilitado para compatibilidade com Swagger
  crossOriginEmbedderPolicy: false,

  // Cross-Origin-Resource-Policy - permite recursos de mesma origem
  crossOriginResourcePolicy: { policy: 'same-origin' },

  // DNS Prefetch Control - desabilita pré-carregamento de DNS
  dnsPrefetchControl: { allow: false },

  // Frameguard - previne clickjacking
  frameguard: { action: 'deny' },

  // Hide Powered-By - remove header X-Powered-By
  hidePoweredBy: true,

  // HSTS - força HTTPS (desabilitado em desenvolvimento)
  hsts:
    process.env.NODE_ENV === 'production'
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,

  // IE No Open - previne downloads automáticos no IE
  ieNoOpen: true,

  // No Sniff - previne MIME type sniffing
  noSniff: true,

  // Origin Agent Cluster - isola a origem
  originAgentCluster: true,

  // Permitted Cross-Domain Policies - restringe políticas Adobe
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },

  // Referrer Policy - controla informações de referência
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // XSS Filter - ativa filtro XSS do navegador
  xssFilter: true,
});

export default helmetConfig;