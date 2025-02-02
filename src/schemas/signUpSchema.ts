import { z } from 'zod';

export const usernameValidation = z.string()
                                .min(2, 'Username must contain atleast 2 characters')
                                .max(20, 'Username must contain atmost 20 characters')
                                .regex(/^[a-zA-Z0-9_]+$/, 'Username must contain only alphanumeric characters');

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: 'Invalid email address'}),
    password: z.string().min(6, {message: 'password must contain atleast 6 characters'})
})