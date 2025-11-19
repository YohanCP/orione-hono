import { sanitize } from "isomorphic-dompurify";
import { MiddlewareHandler } from "hono";

export const sanitizeJsonMiddleware = (): MiddlewareHandler => {
    return async (c, next) => {
        if (c.req.header("Content-Type")?.includes('application/json')) {
            const body = await c.req.json();
            
            // Secara rekursif, sanitasi semua field "string"
            const sanitizeObject = (obj: any): any => {
                if (typeof obj === "string") {
                    return sanitize(obj, {ALLOWED_TAGS: []});
                }
                if (Array.isArray(obj)) {
                    return obj.map(sanitizeObject);
                }
                if (typeof obj === "object" && obj !== null) {
                    const newObj: any = {};
                    for (const key in obj) {
                        newObj[key] = sanitizeObject(obj[key]);
                    }
                    return newObj;
                }
                return obj;
            };

            const cleaned = sanitizeObject(body);

            c.req.json = async () => cleaned;
        }

        await next();
    }
}