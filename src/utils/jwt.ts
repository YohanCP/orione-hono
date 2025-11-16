import * as jose from 'jose';

const AUTH_DURATION = '1d';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

if (!process.env.JWT_SECRET) {
    throw new Error("JWT environment variable is not set.");
}

export async function createToken(userId: number, email: string): Promise<string> {
    const jwt = await new jose.SignJWT({
        sub: userId.toString(),
        email: email,
    })
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime(AUTH_DURATION)
    .sign(secret)
    
    return jwt;
}

export async function verifyToken(token: string): Promise<jose.JWTVerifyResult> {
    try {
        const { payload, protectedHeader } = await jose.jwtVerify(token, secret);
        return { payload, protectedHeader}
    } catch (e) {
        throw new Error('Invalid or expired token!');
    }
    
}