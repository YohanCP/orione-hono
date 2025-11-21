import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "../db/client";
import { hashPassword, verifyPassword } from "../utils/auth";
import { eq } from "drizzle-orm";
import { getCookie, setCookie } from 'hono/cookie';
import { users } from "../db/schema";
import { sanitizeJsonMiddleware } from "../middleware/sanitize";
import { verifyToken ,createAccessToken, createRefreshToken } from "../utils/jwt";
import * as jose from 'jose';

import { getRefreshTokenData, revokeToken, saveRefreshToken } from "../utils/db_manager";

const authRouter = new Hono();

authRouter.use('/register', sanitizeJsonMiddleware());
authRouter.use('/login', sanitizeJsonMiddleware());

// Register route
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
      user: registeredUser,
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

// Login route
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

        const accessToken = await createAccessToken(user.id, user.email);

        const { token: refreshToken, jti } = await createRefreshToken(user.id);
        const refreshTokenPayload = jose.decodeJwt(refreshToken);
        const expiresAt = refreshTokenPayload.exp;

        await saveRefreshToken(user.id, jti, expiresAt as number)
        
        // Set this to a 7 day browser cookie
        setCookie(c, 'refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
            sameSite: 'Lax'
        })
        
        // returning an accessToken helps with mobile app that requires such.
        return c.json({
            message: 'Login successful!',
            accessToken: accessToken
        }, 200);

    } catch (error: any) {
        if (error instanceof HTTPException){
            throw error;
        }
        console.error('Login error', error);
        throw new HTTPException(500, { message: "Internal server error!" });
    }
});

authRouter.post('/refresh', async (c) => {
    try {
        const refreshToken = getCookie(c, 'refresh_token');
        if (!refreshToken) {
            throw new HTTPException(401, { message: 'No session found. Please log in.' });
        }

        // 2. Verify Refresh Token (Cryptographically & Expiration)
        const { payload } = await verifyToken(refreshToken);
        const { sub: userId, email, jti, token_type } = payload;

        // Security check: Ensure we are verifying a refresh token
        if (token_type !== 'refresh' || !jti) {
             throw new HTTPException(403, { message: 'Invalid token type for refresh.' });
        }
        
        const dbRecord = await getRefreshTokenData(jti as string);

        if (!dbRecord || dbRecord.isRevoked) {
            throw new HTTPException(401, { message: 'Session revoked. Please log in again.' });
        }

        // Create a new short-lived Access Token
        const newAccessToken = await createAccessToken(Number(userId), email as string);
        
        // b. Create a new long-lived Refresh Token (recommended for security)
        const { token: newRefreshToken, jti: newJti } = await createRefreshToken(Number(userId));
        
        // c. Revoke the OLD Refresh Token in the database
        await revokeToken(jti as string); 
        
        // d. Save the NEW Refresh Token in the database
        // Need to decode the new token to get its expiration time
        const newRefreshTokenPayload = jose.decodeJwt(newRefreshToken);
        const newExpiresAt = newRefreshTokenPayload.exp;
        
        // Ensure you have the saveRefreshToken function imported/defined
        await saveRefreshToken(Number(userId), newJti, newExpiresAt as number); 
        
        // --- 5. Respond with New Tokens ---
        
        // Overwrite the old cookie with the new Refresh Token
        // MaxAge should match your REFRESH_DURATION (7 days)
        setCookie(c, 'refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: true, 
            maxAge: 60 * 60 * 24 * 7, 
            path: '/', 
            sameSite: 'Lax'
        });

        // Return the new Access Token in the response body
        return c.json({
            message: 'Tokens refreshed successfully!',
            accessToken: newAccessToken
        }, 200);

    } catch (error: any) {
        // Clean up the cookie if any verification or DB check fails dramatically
        setCookie(c, 'refresh_token', '', { maxAge: 0 }); 

        if (error instanceof HTTPException) {
            throw error;
        }
        
        // Specific error for JWT verification failure (e.g., token expired)
        if (error.message.includes('expired')) {
             throw new HTTPException(401, { message: 'Session expired. Please log in.' });
        }

        console.error('Refresh error', error);
        throw new HTTPException(500, { message: 'Internal server error during refresh.' });
    }
});

export default authRouter;