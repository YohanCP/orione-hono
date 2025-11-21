import { db } from '../db/client';
import { eq } from 'drizzle-orm'; 
import { refreshToken } from '../db/schema';

// Save New Refresh Token 
export async function saveRefreshToken(
    userId: number, 
    jti: string, 
    expiresAt: number 
): Promise<void> {
    // Convert Unix timestamp (seconds) to JavaScript Date object
    const expiresDate = new Date(expiresAt * 1000); 

    await db.insert(refreshToken).values({
        jti: jti,
        userId: userId,
        expiresAt: expiresDate,
        isRevoked: false, // Token starts as valid
    });
}

// Check Token Validity
export async function getRefreshTokenData(jti: string): Promise<{ isRevoked: boolean, userId: number } | null> {
    const records = await db.select({
        isRevoked: refreshToken.isRevoked,
        userId: refreshToken.userId 
    })
    .from(refreshToken)
    .where(eq(refreshToken.jti, jti))
    .limit(1);

    return records.length > 0 ? records[0] : null;
}

// Revoke a Token
export async function revokeToken(jti: string): Promise<void> {
    await db.update(refreshToken)
        .set({ isRevoked: true })
        .where(eq(refreshToken.jti, jti));
}