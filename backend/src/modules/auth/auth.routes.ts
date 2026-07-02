import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { loginHandler, meHandler } from "./auth.controller";
import { loginSchema } from "./auth.schema";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), loginHandler);
authRouter.get("/me", authenticate, meHandler);
