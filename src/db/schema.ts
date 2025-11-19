import * as userSchema from './schemas/user';
import * as productSchema from './schemas/products';

export const schema = {
  ...userSchema,
  ...productSchema,
}

export const users = userSchema.users;
export const products = productSchema.products;


export type { User, NewUser } from './schemas/user'
export type { Product, NewProduct } from './schemas/products'