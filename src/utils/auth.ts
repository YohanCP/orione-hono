export async function hashPassword(password: string): Promise<string> {
    return `hashed_${password}_secure`; 
}