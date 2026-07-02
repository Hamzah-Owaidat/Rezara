import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

function mapPrismaError(err: Prisma.PrismaClientKnownRequestError): AppError {
  switch (err.code) {
    case "P2002":
      return new AppError(409, "A record with this value already exists", err.code);
    case "P2025":
      return new AppError(404, "Record not found", err.code);
    default:
      return new AppError(500, "Database error", err.code);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    appError = mapPrismaError(err);
  } else {
    appError = new AppError(500, "Internal server error");
  }

  if (appError.statusCode >= 500 && env.NODE_ENV !== "test") {
    console.error(err);
  }

  res.status(appError.statusCode).json({
    error: {
      message: appError.message,
      code: appError.code,
    },
  });
}
