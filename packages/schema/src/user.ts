import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  passwordHash: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;

// User creation schema (for registration)
export const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(100),
});

export type UserCreate = z.infer<typeof userCreateSchema>;

// User login schema
export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type UserLogin = z.infer<typeof userLoginSchema>;
