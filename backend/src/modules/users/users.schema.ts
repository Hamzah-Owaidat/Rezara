import { z } from "zod";

const assignableRole = z.enum(["ADMIN", "EDITOR", "VIEWER"]);

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: assignableRole,
});

export const updateUserSchema = z
  .object({
    name: z.string().min(1).optional(),
    role: assignableRole.optional(),
  })
  .refine((data) => data.name !== undefined || data.role !== undefined, {
    message: "At least one of name or role must be provided",
  });

export const userIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
