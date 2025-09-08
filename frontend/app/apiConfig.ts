const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  // You can add more configuration values here
} as const;

export default API_CONFIG;