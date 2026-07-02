import { prisma } from "../../lib/prisma";
import { hashPassword } from "../../utils/password";
import type { CreateUserInput, UpdateUserInput } from "./users.schema";

const safeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function listUsers() {
  return prisma.user.findMany({ select: safeSelect, orderBy: { id: "asc" } });
}

export async function createUser(input: CreateUserInput) {
  const hashed = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      role: input.role,
    },
    select: safeSelect,
  });
}

export function updateUser(id: number, input: UpdateUserInput) {
  return prisma.user.update({
    where: { id },
    data: input,
    select: safeSelect,
  });
}

export function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}
