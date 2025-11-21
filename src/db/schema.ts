import * as userSchema from './schemas/user';
import * as productSchema from './schemas/products';
import * as refreshTokenSchema from './schemas/refreshTokens'

// Schemas to be used as a table
export const schema = {
  ...userSchema,
  ...productSchema,
  ...refreshTokenSchema
}

export const users = userSchema.users;
export const products = productSchema.products;
export const refreshToken = refreshTokenSchema.refreshTokens;

export type { User, NewUser } from './schemas/user'
export type { Product, NewProduct } from './schemas/products'