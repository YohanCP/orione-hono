import * as jose from 'jose';
import { randomUUID } from 'crypto';

const ACCESS_DURATION = '15m';
const REFRESH_DURATION = '7d';
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

if (!process.env.JWT_SECRET) {
    throw new Error("JWT environment variable is not set.");
}

// export async function createToken(userId: number, email: string): Promise<string> {
//     const jwt = await new jose.SignJWT({
//         sub: userId.toString(),
//         email: email,
//     })
//     .setProtectedHeader({alg: 'HS256'})
//     .setIssuedAt()
//     .setExpirationTime(AUTH_DURATION)
//     .sign(secret)
    
//     return jwt;
// }

export async function createAccessToken(userId: number, email: string): Promise<string> {
    return new jose.SignJWT({
        sub: userId.toString(),
        email: email,
        token_type: 'access'
    })
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime(ACCESS_DURATION)
    .sign(secret)
}

export async function createRefreshToken(userId:number): Promise<{token: string, jti:string}> {
    const jti = randomUUID();

    const token = await new jose.SignJWT({
        sub: userId.toString(),
        token_type: 'refresh'
    })
    .setJti(jti)
    .setProtectedHeader({alg: 'HS256'})
    .setExpirationTime(REFRESH_DURATION)
    .sign(secret);

    return { token, jti }
    
}

export async function verifyToken(token: string): Promise<jose.JWTVerifyResult> {
    try {
        const result = await jose.jwtVerify(token, secret);
        return result;
    } catch (e) {
        throw new Error('Invalid or expired token!');
    }
    
}