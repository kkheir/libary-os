import {z} from "zod";

export const registerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
});

export const createBookSchema = z.object({
    title: z.string().min(1).max(200),
    author: z.string().min(1).max(120),
    isbn: z.string().max(40).optional().or(z.literal("")),
    genre: z.string().max(80).optional().or(z.literal("")),
    publishedYear: z
        .union([z.number().int().min(0).max(new Date().getFullYear() + 1), z.nan()])
        .optional(),
    description: z.string().max(800).optional().or(z.literal("")),
});

export const updateBookSchema = createBookSchema.partial().extend({
    title: z.string().min(1).max(200),
    author: z.string().min(1).max(120),
});
