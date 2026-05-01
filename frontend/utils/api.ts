// In production (Vercel monorepo), the backend is routed through the /_/backend prefix.
// In development, we use the local 5000 port.
const isProd = process.env.NODE_ENV === 'production';
const vercelBackendPrefix = '/_/backend';

export const API_BASE_URL = isProd 
  ? (process.env.NEXT_PUBLIC_BACKEND_URL || vercelBackendPrefix)
  : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000');

