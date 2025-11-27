import { Hono } from "hono";
import { cors } from "hono/cors"
import authRouter from "./routes/auth";

const app = new Hono();

const welcomeStrings = [
  `Hello Hono from Bun ${process.versions.bun}!`,
  "To learn more about Hono + Bun on Vercel, visit https://vercel.com/docs/frameworks/backend/hono",
];

// For development, use localhost
const allowedOrigins = [
  // 'https://orionetech.vercel.app',
  // Development build
  // 'https://localhost:3000',
  // 'https://localhost:3001',
  '*',
]

app.use('*', cors({
  // origin: allowedOrigins,
  origin: allowedOrigins,
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.get("/", (c) => {
  return c.text(welcomeStrings.join("\n\n"));
});

app.route('/', authRouter)

export default app;
