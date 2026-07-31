import { z } from "zod";

export const authSchema = z.object({
  email: z
    .string()
    .email("Correo electrónico inválido")
    .transform((e) => e.toLowerCase().trim()),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100),
  fullName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200)
    .optional(),
});

export const loginSchema = authSchema.pick({ email: true, password: true });

export const registerSchema = authSchema;

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;