import z from "zod";

export const signUpSchema = z.object({
    email: z.string(),
    password: z.string(),
});