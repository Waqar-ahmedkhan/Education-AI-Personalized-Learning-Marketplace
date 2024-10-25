// src/controllers/user.controller.ts
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/CatchAsyncError";
import UserModel, { IUser, IUserInput } from "../models/user.model";
import { AppError } from "../utils/AppError";
import jwt, { Secret } from "jsonwebtoken";
import  sendEmail  from "../utils/Sendemail";

interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: {
    public_id: string;
    url: string;
  };
}

interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: IUserInput): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  
  const token = jwt.sign(
    {
      email: user.email,
      activationCode,
    },
    process.env.ACTIVATION_SECRET as Secret,
    { expiresIn: "5m" }
  );
  
  return { token, activationCode };
};

export const registerUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, avatar } = req.body as IRegistrationBody;

      // Check if email exists
      const isEmailExist = await UserModel.findOne({ email });
      if (isEmailExist) {
        return next(new AppError("Email already exists", 400));
      }

      // Create user input object
      const userInput: IUserInput = {
        name,
        email,
        password,
       };

      // Generate activation token
      const activationToken = createActivationToken(userInput);

      // Prepare email data
      const emailData = {
        user: { name: userInput.name },
        activationCode: activationToken.activationCode
      };

      try {
        // Create user in database
        const newUser = await UserModel.create(userInput);

        // Send activation email
        await sendEmail({
          email: userInput.email,
          subject: "Account Activation - EduAI",
          template: "activation-code.ejs",
          data: emailData
        });

        res.status(201).json({
          success: true,
          message: "Registration successful! Please check your email for activation code.",
          activationToken: activationToken.token
        });
      } catch (error) {
        return next(new AppError("Error creating user", 500));
      }
    } catch (error) {
      return next(new AppError("Registration failed", 500));
    }
  }
);