import { Hono } from "hono";
import { HTTPException } from "hono/http-exception"
import { hashPassword } from "./utils/auth";
import { db } from "./db/client";
import { users } from "./db/schema";
import { cors } from "hono/cors"

const app = new Hono();

const welcomeStrings = [
  `Hello Hono from Bun ${process.versions.bun}!`,
  "To learn more about Hono + Bun on Vercel, visit https://vercel.com/docs/frameworks/backend/hono",
];

app.use('*', cors({
  origin: '*',
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

app.get("/", (c) => {
  return c.text(welcomeStrings.join("\n\n"));
});

app.get("/about", (c) => {
  return c.text('Anjaye')
})

app.post('/register', async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    throw new HTTPException(400, { message: "Email and password are required"});
  }

  const passwordHash = await hashPassword(password);

  try {
    const [registeredUser] = await db.insert(users)
      .values({
        email,
        password: passwordHash,
      })
      .returning({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
      });
    return c.json({
      message: 'User registered successfully',
      user: registeredUser
    }, 201);
  } catch (error: any){
    if (error.code === '23505'){
      throw new HTTPException(409, { message: 'Email is already registered' });
    }
    console.error('Database error:', error);
    throw new HTTPException(500, { message: 'Internal server error,' });
  }
});


export default app;
