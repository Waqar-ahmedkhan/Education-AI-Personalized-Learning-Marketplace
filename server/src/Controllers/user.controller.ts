import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/CatchAsyncError";
import UserModel, { IUserInput } from "../models/user.model";
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

export const createActivationToken = (user: IUserInput): IActivationToken => {
  if (!process.env.ACTIVATION_SECRET) {
    throw new Error('ACTIVATION_SECRET is not defined in environment variables');
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
      // Log the request body for debugging

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
      const existingUser = await UserModel.findOne({ email }).select('+email');
      if (existingUser) {
        return next(new AppError("Email already exists", 400));
      }

      // Create user input object
      const userInput: IUserInput = {
        name,
        email,
        password,
        // isVerified: false,
        // role: "user"
      };

      // Generate activation token
      let activationToken;
      try {
        activationToken = createActivationToken(userInput);
      } catch (tokenError: any) {
        console.error('Token creation error:', tokenError);
        return next(new AppError(tokenError.message || "Failed to create activation token", 500));
      }

      // Create new user
      let newUser;
      try {
        // newUser = await UserModel.create(userInput);
      } catch (userError: any) {
        console.error('User creation error:', userError);
        if (userError.code === 11000) {
          return next(new AppError("Email already exists", 400));
        }
        return next(new AppError(userError.message || "Error creating user", 500));
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
        // If email fails, delete the created user
        // if (newUser) {
        //   await UserModel.findByIdAndDelete(newUser._id);
        // }
        console.error('Email sending error:', emailError);
        return next(new AppError("Failed to send activation email", 500));
      }

      // Success response
      return res.status(201).json({
        success: true,
        message: "Registration successful! Please check your email for activation code.",
        activationToken: activationToken.token,
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      // Ensure we don't send multiple responses
      if (!res.headersSent) {
        return next(new AppError(error.message || "Registration failed", 500));
      }
    }
  }
);