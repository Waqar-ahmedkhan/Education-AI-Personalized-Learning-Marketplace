import { Request } from "express";
import { IUserInput } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: IUserInput;
    }
  }
}
