import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/CatchAsyncError";
import UserModel, { IUser, IUserInput } from "../models/user.model";
import { AppError } from "../utils/AppError";
import jwt, { Secret } from "jsonwebtoken";
import sendEmail from "../utils/Sendemail";

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

interface IActivationRequest {
  activation_token: string;
  activation_code: string;
  name: string;
  email: string;
  password: string;
}

interface IActivationPayload {
  email: string;
  activationCode: string;
}

export const createActivationToken = (user: IUserInput): IActivationToken => {
  if (!process.env.ACTIVATION_SECRET) {
    throw new Error("ACTIVATION_SECRET is not defined in environment variables");
  }

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
      const { name, email, password } = req.body as IRegistrationBody;

      // Validate required fields
      if (!email || !password || !name) {
        return next(new AppError("Please provide all required fields", 400));
      }

      // Check email format
      const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
      if (!emailRegex.test(email)) {
        return next(new AppError("Please provide a valid email address", 400));
      }

      // Check if email exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return next(new AppError("Email already exists", 400));
      }

      // Create user input object
      const userInput: IUserInput = {
        name,
        email,
        password,
      };

      // Generate activation token
      let activationToken;
      try {
        activationToken = createActivationToken(userInput);
      } catch (tokenError: any) {
        console.error("Token creation error:", tokenError);
        return next(
          new AppError(
            tokenError.message || "Failed to create activation token",
            500
          )
        );
      }

      // Prepare email data
      const emailData = {
        user: { name: userInput.name },
        activationCode: activationToken.activationCode,
      };

      try {
        await sendEmail({
          email: userInput.email,
          subject: "Account Activation - EduAI",
          template: "activation-code.ejs",
          data: emailData,
        });
      } catch (emailError: any) {
        console.error("Email sending error:", emailError);
        return next(new AppError("Failed to send activation email", 500));
      }

      // Success response
      return res.status(201).json({
        success: true,
        message: "Registration successful! Please check your email for activation code.",
        activationToken: activationToken.token,
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      if (!res.headersSent) {
        return next(new AppError(error.message || "Registration failed", 500));
      }
    }
  }
);

export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code, name, email, password } = 
        req.body as IActivationRequest;

      // Verify the activation token
      const decoded = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as Secret
      ) as IActivationPayload;

      if (decoded.activationCode !== activation_code) {
        return next(new AppError("Invalid activation code", 400));
      }

      // Verify the email matches the one in the token
      if (decoded.email !== email) {
        return next(new AppError("Email mismatch", 400));
      }

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return next(new AppError("Email already exists", 400));
      }

      // Create the user
      const user = await UserModel.create({
        name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        message: "User activated successfully",
        user,
      });
    } catch (error: any) {
      console.error("Activation error:", error);
      if (error.name === "JsonWebTokenError") {
        return next(new AppError("Invalid activation token", 400));
      }
      if (error.name === "TokenExpiredError") {
        return next(new AppError("Activation token has expired", 400));
      }
      return next(new AppError("Failed to activate user", 500));
    }
  }
);