import { neon } from '@neondatabase/serverless';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.NEON_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('NEON_DATABASE_URL is not set');
}

export const sql = neon(DATABASE_URL);

export const QUERY_TIMEOUT_MS = 30000;

export async function withRetry<T>(
  queryFn: () => Promise<T>,
  retries = 3,
  delayMs = 1500
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : '';
      const isTimeout = message.includes('ETIMEDOUT') || message.includes('timeout') || message.includes('fetch failed') || message.includes('ENETUNREACH');
      if (!isTimeout || attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

export async function withNeonTimeout<T>(queryFn: () => Promise<T>): Promise<T> {
  return withRetry(queryFn);
}

export default sql;
