// drizzle-empty.config.ts

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql', 

  // FIX: Point the schema property to a single, non-existent file path.
  // Drizzle Kit will process it, find no table exports, and assume the schema is empty.
  schema: './src/db/empty-schema.ts', 
  
  // You must ensure this variable is loaded in your shell
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!, 
  },
  
  // ... other optional settings ...
  verbose: true,
  strict: true,
});