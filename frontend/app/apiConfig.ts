const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8080`,
  // You can add more configuration values here
} as const;

export default API_CONFIG;