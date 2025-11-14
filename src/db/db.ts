// ./db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres = require('postgres');
// You might need to adjust the driver import based on your specific setup (e.g., node-postgres, neon-http)

// Replace with your actual connection string, usually from process.env
const connectionString = process.env.DATABASE_URL!; 

// Create a postgres client
const queryClient = postgres(connectionString); 

// Create the Drizzle client instance
export const db = drizzle(queryClient);