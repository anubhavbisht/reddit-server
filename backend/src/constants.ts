import dotenv from 'dotenv';
dotenv.config();

export const __prod__ = process.env.NODE_ENV === 'production'
export const COOKIE_NAME = 'auth-token'
export const REDIS_AUTH_PREFIX = 'auth:'
export const REDIS_PASSWORD_PREFIX = 'forgot:'