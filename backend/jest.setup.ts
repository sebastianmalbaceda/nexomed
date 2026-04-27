import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '.env');
const fallbackEnvPath = path.resolve(__dirname, '..', '.env.example');

dotenv.config({ path: envPath });
dotenv.config({ path: fallbackEnvPath, override: false });

process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
