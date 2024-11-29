import { NextFunction, Request, Response } from "express";

export const CatchAsyncError =
  (
    thefunc: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ) =>
  (req: Request, res: Response, next: NextFunction): void => {
    thefunc(req, res, next).catch(next);
  };
