import * as userSchema from './schemas/user';

export const schema = {
  ...userSchema,
}

export const users = userSchema.users;
export type { User, NewUser } from './schemas/user'