import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/requireRole";
import { validate } from "../../middleware/validate";
import {
  createUserHandler,
  deleteUserHandler,
  listUsersHandler,
  updateUserHandler,
} from "./users.controller";
import { createUserSchema, updateUserSchema, userIdParamsSchema } from "./users.schema";

export const usersRouter = Router();

usersRouter.use(authenticate, requireRole("ADMIN"));

usersRouter.get("/", listUsersHandler);
usersRouter.post("/", validate(createUserSchema), createUserHandler);
usersRouter.patch(
  "/:id",
  validate(userIdParamsSchema, "params"),
  validate(updateUserSchema),
  updateUserHandler
);
usersRouter.delete("/:id", validate(userIdParamsSchema, "params"), deleteUserHandler);
