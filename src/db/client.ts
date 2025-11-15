// db/client.ts for Hono API routes
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema'

// Uses the pooled connection string
const sql = neon(process.env.DATABASE_URL!); 
export const db = drizzle(sql,{
  schema
});