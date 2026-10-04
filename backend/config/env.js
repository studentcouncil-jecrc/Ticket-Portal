import 'dotenv/config';

const localDevelopmentOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

const normalizeOrigin = (value) => {
  try {
    const origin = new URL(value.trim()).origin;

    if (origin === 'null') {
      throw new Error('Origin must include a protocol and hostname');
    }

    return origin;
  } catch {
    throw new Error(`Invalid CORS origin: ${value}`);
  }
};

export const getAllowedOrigins = () => {
  const configuredOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  const origins = process.env.NODE_ENV === 'production'
    ? configuredOrigins
    : [...localDevelopmentOrigins, ...configuredOrigins];

  return [...new Set(origins)];
};

export const validateEnvironment = () => {
  const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'APP_ADMIN_JWT_SECRET',
    'VERIFIED_FROM_EMAIL',
    'RESEND_API_KEY',
  ];

  if (process.env.NODE_ENV === 'production') {
    required.push('CORS_ORIGINS');
  }

  const missing = required.filter((name) => !process.env[name]?.trim());

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate origins at startup, before the server accepts browser traffic.
  getAllowedOrigins();
};
