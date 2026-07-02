import { NextFunction, Request, Response } from "express";
import { z, ZodType } from "zod";
import { AppError } from "../utils/AppError";

type ValidateTarget = "body" | "params" | "query";

export function validate(schema: ZodType, target: ValidateTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return next(new AppError(400, z.prettifyError(result.error)));
    }

    // req.query is a read-only getter in Express 5, so it can't be reassigned like body/params.
    if (target === "query") {
      req.validatedQuery = result.data;
    } else {
      req[target] = result.data;
    }

    next();
  };
}
