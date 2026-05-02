// In production, the API_BASE_URL should be set via NEXT_PUBLIC_BACKEND_URL environment variable.
// If not set, we default to the /_/backend prefix used in the Vercel monorepo config.
const isProd = process.env.NODE_ENV === 'production';

export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
  (isProd ? '/_/backend' : 'http://localhost:5000');

