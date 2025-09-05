import type { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  req.userId = "test-user"; // always inject fake userId
  next();
};
