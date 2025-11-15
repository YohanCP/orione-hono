export async function hashPassword(password: string): Promise<string> {
    const hash = await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: 10
    });
    return hash;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean>{
    return await Bun.password.verify(password, hash);
}