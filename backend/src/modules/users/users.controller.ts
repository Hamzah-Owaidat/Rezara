import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as usersService from "./users.service";
import type { CreateUserInput, UpdateUserInput } from "./users.schema";

export const listUsersHandler = asyncHandler(async (_req: Request, res: Response) => {
  const users = await usersService.listUsers();
  res.status(200).json({ users });
});

export const createUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.createUser(req.body as CreateUserInput);
  res.status(201).json({ user });
});

export const updateUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = await usersService.updateUser(id, req.body as UpdateUserInput);
  res.status(200).json({ user });
});

export const deleteUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await usersService.deleteUser(id);
  res.status(204).send();
});
