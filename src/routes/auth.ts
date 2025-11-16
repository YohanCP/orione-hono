import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "../db/client";
import { hashPassword, verifyPassword } from "../utils/auth";
import { eq } from "drizzle-orm";
import { createToken } from "../utils/jwt";
import { setCookie } from 'hono/cookie';
import { users } from "../db/schema";
import { sanitizeJsonMiddleware } from "../middleware/sanitize";

const authRouter = new Hono();

authRouter.use('/register', sanitizeJsonMiddleware());
authRouter.use('/login', sanitizeJsonMiddleware());

authRouter.post('/register', async (c) => {
  const { username, email, password, } = await c.req.json();

  const lowerEmail = email.toLowerCase().trim();
  const lowerUsername = username.toLowerCase().trim();
  const passwordHash = await hashPassword(password);

  if (!username || !email || !password) {
    throw new HTTPException(400, { message: "All field required!"});
  }

  try {
    const [registeredUser] = await db.insert(users)
      .values({
        username: lowerUsername,
        email: lowerEmail,
        password: passwordHash,
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt,
      });
    return c.json({
      message: 'User registered successfully',
      user: registeredUser
    }, 201);
  } catch (error: any){
    if (error.code === '23505'){
      const detail = error.detail || error.message || '';
      let errorMessage = 'An account with this email or username already exists.';

      if (detail.includes('users_email_unique')) {
        errorMessage = 'The email address is already registered!';
      } else if (detail.includes('users_username_unique')) {
        errorMessage = 'The chosen username is already taken.';
      }

      throw new HTTPException(409, { message: errorMessage });

    }
    console.error('Database error:', error);
    throw new HTTPException(500, { message: 'Internal server error,' });
  }
});

authRouter.post('/login', async(c) => {
    const { email, password } = await c.req.json();
    const lowerEmail = email.toLowerCase().trim();

    if (!email || !password) {
        throw new HTTPException(400, { message: "Email and password are required!"});
    }

    try {
        const userRecords = await db.select()
            .from(users)
            .where(eq(users.email, lowerEmail))
            .limit(1);
        
        const user = userRecords[0];

        if (!user){
            throw new HTTPException(401, { message: "User does not exist!" });
        }

        const passwordMatch = await verifyPassword(password, user.password)

        if (!passwordMatch){
            throw new HTTPException(401, { message: "Invalid password!" });
        }

        const token = await createToken(user.id, user.email);

        setCookie(c, 'auth_token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 1,
            path: '/',
            sameSite: 'Lax'
        })

        return c.json({
            message: 'Login successful!',
        }, 200);

    } catch (error: any) {
        if (error instanceof HTTPException){
            throw error;
        }
        console.error('Login error', error);
        throw new HTTPException(500, { message: "Internal server error!" });
    }
});

export default authRouter;