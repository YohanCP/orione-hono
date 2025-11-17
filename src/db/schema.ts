import * as userSchema from './schemas/user';
import * as productSchema from './schemas/products';

export const schema = {
  ...userSchema,
  ...productSchema,
}

export const users = userSchema.users;
export type { User, NewUser } from './schemas/user'