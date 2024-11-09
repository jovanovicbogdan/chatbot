export const BASE_API_URL =
  import.meta.env.VITE_APP_ENV === 'development'
    ? 'http://localhost:8080/api'
    : 'https://qabot.staging.platform.usw2.upwork/api';
export const API_VERSION = 'v1';
