import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/CatchAsyncError";
import UserModel from "../models/user.model";
import { AppError } from "../utils/AppError";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import sendEmail from "../utils/Sendemail";
import {accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt";
import { client } from "../utils/RedisConnect";
import { getUserbyId } from "../services/user.services";

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
}

export const createActivationToken = (
  user: IRegistrationBody
): IActivationToken => {
  if (!process.env.ACTIVATION_SECRET) {
    throw new Error(
      "ACTIVATION_SECRET is not defined in environment variables"
    );
  }

  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
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
        return next(
          new AppError("Validation failed", 400, {
            errors: {
              email: !email ? "Email is required" : undefined,
              password: !password ? "Password is required" : undefined,
              name: !name ? "Name is required" : undefined,
            },
          })
        );
      }

      // Check email format
      const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
      if (!emailRegex.test(email)) {
        return next(new AppError("Please provide a valid email address", 400));
      }

      // Check if email exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        res.json({
          status: "400",
          message: "Email already exists",
          path: "email",
          value: req.body.email,
        });
        return next(
          new AppError("Email already exists", 400, {
            path: "email",
            value: req.body.email,
          })
        );
      }

      // Create user input object
      const userInput: IRegistrationBody = {
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
        message:
          "Registration successful! Please check your email for activation code.",
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
      const { activation_token, activation_code } =
        req.body as IActivationRequest;

      // Verify the activation token
      const decoded = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as Secret
      ) as { user: IRegistrationBody; activationCode: string };

      // Verify activation code
      if (decoded.activationCode !== activation_code) {
        return next(new AppError("Invalid activation code", 400));
      }

      const { email, name, password } = decoded.user;

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

// create login

interface loginType {
  email: string;
  password: string;
}
export const UserLogin = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as loginType;

      if (!email || !password) {
        return next(new AppError("Please enter both email and password", 400));
      }

      const user = await UserModel.findOne({ email }).select("+password");
      if (!user) {
        return next(new AppError("Incorrect email or password", 400));
      }

      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return next(new AppError("Incorrect email or password", 400));
      }

      // Generate and send tokens
      sendToken(user, 200, res);
    } catch (err) {
      console.log("Error in login:", err);
      res.status(400).json({
        success: false,
        message: "Error during login",
      });
    }
  }
);

// User Logout Controller
export const UserLogout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "", { maxAge: 1 });
      res.cookie("refresh_token", "", { maxAge: 1 });

      // await client.del(req.user?.id);
      const userId = String(req.user?._id);
      try{
          await client.del(userId)
      } catch(err){
        res.status(400).json({
           success: false,
           message: "error in redis"
        })
      }

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: "Error during logout",
      });
    }
  }
);

export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token;

      if (!refresh_token) {
        return next(new AppError("Please login again", 401));
      }

      // Verify refresh token
      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(
          refresh_token,
          process.env.REFRESH_TOKEN_SECRET as string
        ) as JwtPayload;
      } catch (error: any) {
        if (error.name === "TokenExpiredError") {
          return next(new AppError("Refresh token expired, please login again", 401));
        }
        return next(new AppError("Invalid refresh token", 401));
      }

      // Get user from Redis
      const session = await client.get(decoded.id);
      if (!session) {
        return next(new AppError("Please login again", 401));
      }

      const user = JSON.parse(session);

      // Generate new access token
      const access_token = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "8m" } // Set according to your environment variable
      );

      // Generate new refresh token
      const new_refresh_token = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: "4d" } // Set according to your environment variable
      );

      // Update session in Redis
      user.refresh_token = new_refresh_token; // Update refresh token
      await client.set(user._id, JSON.stringify(user));

      // Set new cookies
      res.cookie("access_token", access_token, accessTokenOptions);
      res.cookie("refresh_token", new_refresh_token, refreshTokenOptions);

      res.status(200).json({
        status: "success",
        access_token,
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      return next(new AppError("Error refreshing access token", 500));
    }
  }
);


export const getUserInformatin = async(req:Request, res:Response, next: NextFunction)=> {
  try {
    const userId = String(req.user?._id);
    getUserbyId(userId, res);
  } catch(err){
    console.log("Error in get user information:", err);
    res.status(400).json({
      success: false,
      message: "Error during get user information",
    });
  }


}

interface ISoicalAuth {
   name: string,
   email: string,
   avatar: string,
}

export const socialAuth = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try{
    const { email,  name,  avatar } = req.body as ISoicalAuth;
    if(!email ||!name ||! avatar ){
      return next(new AppError("Please provide all required fields", 400));
    }

    const user = await UserModel.create({ email, name,avatar,});
    if(!user){
      const newUser =await UserModel.create({ email, name, avatar})  
      sendToken(newUser, 200, res)
    } else {
      sendToken(user, 200, res )
    }
  }  catch(err){
    console.log("error is not gooded")
  }
})


interface IUpdateUserInterface {
  name: string;
  email: string;
}

export const UpdateUserInformation = CatchAsyncError( async (req: Request, res: Response)=> {
        try {
            
          const { name, email } = req.body as IUpdateUserInterface
          const userId = req.user?._id;
          const user = await UserModel.findById(userId);

          

        }  catch(err){
          console.log(err);
        }    
})
