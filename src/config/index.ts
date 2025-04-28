export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 5000,
  },
  auth: {
    tokenKey: 'token',
    refreshTokenKey: 'refreshToken',
  },
  app: {
    name: 'FitSync',
    version: '1.0.0',
  },
  routes: {
    home: '/home',
    login: '/',
    workout: '/workout',
  },
} as const; 