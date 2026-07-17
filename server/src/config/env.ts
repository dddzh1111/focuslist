import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.SERVER_PORT || '3001', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
