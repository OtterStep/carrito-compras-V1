import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET as string,
  env: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
};

if (!config.jwtSecret && config.env !== 'test') {
  throw new Error('JWT_SECRET is not defined');
}
