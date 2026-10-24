import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'ralypto_super_secure_jwt_secret_lkr_retail_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'ralypto_super_secure_refresh_token_secret_2026',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'LKR',
  defaultTimezone: process.env.DEFAULT_TIMEZONE || 'Asia/Colombo',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
