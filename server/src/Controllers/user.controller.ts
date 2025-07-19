import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/CatchAsyncError";
import UserModel from "../models/user.model";
import { AppError } from "../utils/AppError";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import sendEmail from "../utils/Sendemail";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { client } from "../utils/RedisConnect";
import {
  getalluserServices,
  getUserbyId,
  UpdateUserRoleServices,
} from "../services/user.services";
import cloudinary from "cloudinary";
import * as crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
import { google } from "googleapis";

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

      // Comprehensive validation with detailed error messages
      const validationErrors: Record<string, string> = {};

      // Name validation
      if (!name || typeof name !== "string") {
        validationErrors.name = "Name is required";
      } else if (name.trim().length < 2) {
        validationErrors.name = "Name must be at least 2 characters long";
      } else if (name.trim().length > 50) {
        validationErrors.name = "Name must not exceed 50 characters";
      } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
        validationErrors.name = "Name can only contain letters and spaces";
      }

      // Email validation
      if (!email || typeof email !== "string") {
        validationErrors.email = "Email is required";
      } else {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email.trim().toLowerCase())) {
          validationErrors.email = "Please provide a valid email address";
        } else if (email.length > 100) {
          validationErrors.email = "Email must not exceed 100 characters";
        }
      }

      // Password validation
      if (!password || typeof password !== "string") {
        validationErrors.password = "Password is required";
      } else if (password.length < 8) {
        validationErrors.password =
          "Password must be at least 8 characters long";
      } else if (password.length > 128) {
        validationErrors.password = "Password must not exceed 128 characters";
      } else if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
          password
        )
      ) {
        validationErrors.password =
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
      }

      // Return validation errors if any
      if (Object.keys(validationErrors).length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        });
      }

      // Normalize email
      const normalizedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();

      // Check if user already exists
      let existingUser;
      try {
        existingUser = await UserModel.findOne({
          email: normalizedEmail,
        }).select("email");
      } catch (dbError: any) {
        console.error("Database query error:", dbError);
        return res.status(500).json({
          success: false,
          message: "Database connection error. Please try again later.",
        });
      }

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists",
          errors: {
            email:
              "This email is already registered. Please use a different email or try logging in.",
          },
        });
      }

      // Create user input object
      const userInput: IRegistrationBody = {
        name: trimmedName,
        email: normalizedEmail,
        password: password, // Keep original password for hashing
      };

      // Generate activation token with error handling
      let activationToken;
      try {
        activationToken = createActivationToken(userInput);

        // Validate token creation
        if (
          !activationToken ||
          !activationToken.token ||
          !activationToken.activationCode
        ) {
          throw new Error("Invalid token structure generated");
        }
      } catch (tokenError: any) {
        console.error("Token creation error:", tokenError);
        return res.status(500).json({
          success: false,
          message: "Failed to generate activation code. Please try again.",
        });
      }

      // Prepare email data with proper structure
      const emailData = {
        user: {
          name: userInput.name,
          email: userInput.email,
        },
        activationCode: activationToken.activationCode,
        appName: "EduAI",
        supportEmail: process.env.SUPPORT_EMAIL || "support@eduai.com",
      };

      // Send activation email with comprehensive error handling
      try {
        await sendEmail({
          email: userInput.email,
          subject: "Account Activation - EduAI",
          template: "activation-code.ejs",
          data: emailData,
        });
      } catch (emailError: any) {
        console.error("Email sending error:", emailError);

        // Different error messages based on email error type
        let emailErrorMessage = "Failed to send activation email";

        if (emailError.code === "ENOTFOUND") {
          emailErrorMessage = "Email service temporarily unavailable";
        } else if (emailError.responseCode === 550) {
          emailErrorMessage = "Invalid email address provided";
        } else if (emailError.responseCode === 554) {
          emailErrorMessage = "Email rejected by recipient server";
        }

        return res.status(500).json({
          success: false,
          message: `${emailErrorMessage}. Please try again or contact support.`,
        });
      }

      // Log successful registration (without sensitive data)
      console.log(`User registration initiated for email: ${userInput.email}`);

      // Success response
      return res.status(201).json({
        success: true,
        message:
          "Registration successful! Please check your email for the activation code.",
        activationToken: activationToken.token,
        data: {
          email: userInput.email,
          name: userInput.name,
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);

      // Ensure headers aren't already sent
      if (res.headersSent) {
        return;
      }

      // Handle different types of errors
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation error occurred",
          errors: error.errors,
        });
      }

      if (error.name === "MongoError" || error.name === "MongooseError") {
        return res.status(500).json({
          success: false,
          message: "Database error. Please try again later.",
        });
      }

      // Generic error response
      return res.status(500).json({
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      });
    }
  }
);

export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;

      // Validate input
      if (!activation_token) {
        return res.status(400).json({
          success: false,
          message:
            "Activation link is invalid or expired. Please request a new activation code.",
          errorCode: "MISSING_TOKEN",
        });
      }

      if (!activation_code) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter the 4-digit activation code sent to your email.",
          errorCode: "MISSING_CODE",
        });
      }

      // Validate activation code format
      if (!/^\d{4}$/.test(activation_code.trim())) {
        return res.status(400).json({
          success: false,
          message:
            "Activation code must be exactly 4 digits. Please check your email for the correct code.",
          errorCode: "INVALID_CODE_FORMAT",
        });
      }

      let decoded: { user: IRegistrationBody; activationCode: string };

      try {
        // Verify the activation token
        decoded = jwt.verify(
          activation_token,
          process.env.ACTIVATION_SECRET as Secret
        ) as { user: IRegistrationBody; activationCode: string };
      } catch (jwtError: any) {
        console.error("JWT verification error:", jwtError);

        if (jwtError.name === "TokenExpiredError") {
          return res.status(400).json({
            success: false,
            message:
              "Your activation code has expired. Please request a new activation code to continue.",
            errorCode: "TOKEN_EXPIRED",
            action: "REQUEST_NEW_CODE",
          });
        }

        if (jwtError.name === "JsonWebTokenError") {
          return res.status(400).json({
            success: false,
            message:
              "Invalid activation link. Please use the latest activation email or request a new code.",
            errorCode: "INVALID_TOKEN",
            action: "REQUEST_NEW_CODE",
          });
        }

        return res.status(400).json({
          success: false,
          message:
            "Activation link is corrupted or invalid. Please request a new activation code.",
          errorCode: "TOKEN_ERROR",
          action: "REQUEST_NEW_CODE",
        });
      }

      // Verify activation code matches
      if (decoded.activationCode !== activation_code.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "The activation code you entered is incorrect. Please check your email and try again.",
          errorCode: "CODE_MISMATCH",
          action: "RETRY_CODE",
        });
      }

      const { email, name, password } = decoded.user;

      // Validate decoded user data
      if (!email || !name || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Activation data is incomplete. Please register again or contact support.",
          errorCode: "INCOMPLETE_DATA",
          action: "REGISTER_AGAIN",
        });
      }

      try {
        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
          // Check if user is already verified
          if (existingUser.isVerified) {
            return res.status(400).json({
              success: false,
              message:
                "This account is already activated. You can log in directly.",
              errorCode: "ALREADY_ACTIVATED",
              action: "GO_TO_LOGIN",
            });
          } else {
            // User exists but not verified, update verification status
            existingUser.isVerified = true;
            await existingUser.save();

            return res.status(200).json({
              success: true,
              message: "Account activated successfully! You can now log in.",
              user: {
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
                isVerified: existingUser.isVerified,
              },
            });
          }
        }

        // Create new user
        const user = await UserModel.create({
          name,
          email,
          password,
          isVerified: true, // Set as verified since they completed activation
        });

        res.status(201).json({
          success: true,
          message:
            "Account activated successfully! Welcome aboard. You can now log in.",
          user: {
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
          },
        });
      } catch (dbError: any) {
        console.error("Database error during activation:", dbError);

        if (dbError.code === 11000) {
          // MongoDB duplicate key error
          return res.status(400).json({
            success: false,
            message:
              "An account with this email already exists. Try logging in instead.",
            errorCode: "DUPLICATE_EMAIL",
            action: "GO_TO_LOGIN",
          });
        }

        return res.status(500).json({
          success: false,
          message:
            "We're having trouble activating your account right now. Please try again in a few minutes.",
          errorCode: "DATABASE_ERROR",
          action: "RETRY_LATER",
        });
      }
    } catch (error: any) {
      console.error("Unexpected activation error:", error);

      // Handle specific known errors
      if (error.message?.includes("validation")) {
        return res.status(400).json({
          success: false,
          message:
            "The information provided is not valid. Please check and try again.",
          errorCode: "VALIDATION_ERROR",
        });
      }

      if (
        error.message?.includes("network") ||
        error.message?.includes("timeout")
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Network issue detected. Please check your connection and try again.",
          errorCode: "NETWORK_ERROR",
          action: "RETRY",
        });
      }

      // Generic error
      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while activating your account. Please try again or contact support if the problem persists.",
        errorCode: "INTERNAL_ERROR",
        action: "RETRY_OR_CONTACT_SUPPORT",
      });
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

      // Validate input
      if (!email || !password) {
        return next(new AppError("Please enter both email and password", 400));
      }

      // Find user and select password
      const user = await UserModel.findOne({ email }).select("+password");
      if (!user) {
        return next(new AppError("Email not found", 401));
      }

      // Check role
      if (user.role !== "user") {
        return next(
          new AppError(
            "This login is for users only. Please use the admin login.",
            403
          )
        );
      }

      // Compare password
      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return next(new AppError("Incorrect password", 401));
      }

      // Send token only if all checks pass
      sendToken(user, 200, res);
    } catch (err: any) {
      console.error("Error in user login:", err);
      // Ensure no response is sent before this point
      return next(new AppError(err.message || "Error during user login", 500));
    }
  }
);

// User Logout Controller
export const UserLogout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?._id) {
        return next(new AppError("User not authenticated", 401));
      }

      res.cookie("access_token", "", {
        maxAge: 1,
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
      });
      res.cookie("refresh_token", "", {
        maxAge: 1,
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
      });

      const userId = String(req.user._id);
      try {
        await client.del(userId);
      } catch (err) {
        console.error(`Redis error during logout for user ${userId}:`, err);
        return res.status(500).json({
          success: false,
          message: "Error clearing session in Redis",
        });
      }

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (err: any) {
      console.error("Logout error:", err);
      return next(new AppError("Error during logout", 500));
    }
  }
);

export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token;

      if (!refresh_token) {
        return next(new AppError('Please login again', 401));
      }

      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(
          refresh_token,
          process.env.REFRESH_TOKEN_SECRET!
        ) as JwtPayload;
      } catch (error: any) {
        return next(
          new AppError(
            error.name === 'TokenExpiredError'
              ? 'Refresh token expired, please login again'
              : 'Invalid refresh token',
            401
          )
        );
      }

      let user = await client.get(decoded.id);
      if (!user) {
        const dbUser = await UserModel.findById(decoded.id).select('name email role isVerified courses courseProgress');
        if (!dbUser) return next(new AppError('User not found', 401));
        user = JSON.stringify(dbUser);
        await client.set(decoded.id, user, { EX: 7 * 24 * 60 * 60 });
      }

      const parsedUser = JSON.parse(user);

      const access_token = jwt.sign(
        { id: parsedUser._id, role: parsedUser.role },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '70m' }
      );

      const new_refresh_token = jwt.sign(
        { id: parsedUser._id, role: parsedUser.role },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '90m' }
      );

      res.cookie('access_token', access_token, accessTokenOptions);
      res.cookie('refresh_token', new_refresh_token, refreshTokenOptions);

      await client.set(
        parsedUser._id,
        JSON.stringify({ ...parsedUser, refresh_token: new_refresh_token }),
        { EX: 7 * 24 * 60 * 60 }
      );

      res.status(200).json({
        success: true,
        accessToken: access_token,
        user: {
          _id: parsedUser._id,
          name: parsedUser.name,
          email: parsedUser.email,
          role: parsedUser.role,
          isVerified: parsedUser.isVerified,
          avatar: parsedUser.avatar,
        },
      });
    } catch (error: any) {
      console.error('Token refresh error:', error);
      return next(new AppError('Error refreshing access token', 500));
    }
  }
);

export const getUserInformatin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = String(req.user?._id);
    getUserbyId(userId, res);
  } catch (err) {
    console.log("Error in get user information:", err);
    res.status(400).json({
      success: false,
      message: "Error during get user information",
    });
  }
};

export const getAdminInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = String(req.user?._id);
      if (!userId) {
        return next(new AppError("User ID not found in token", 401));
      }

      const user = await UserModel.findById(userId).select(
        "-password -resetPasswordToken -resetPasswordExpires"
      );

      if (!user) {
        return next(new AppError("User not found", 404));
      }

      if (user.role !== "admin") {
        return next(new AppError("Access denied: Admin role required", 403));
      }

      res.status(200).json({
        success: true,
        user: {
          _id: String(user._id), // safe and readable
          name: user.name,
          role: user.role,
          email: user.email,
          isVerified: user.isVerified,
        },
      });
    } catch (error: any) {
      console.error("Error in getAdminInfo:", error);
      return next(new AppError("Failed to fetch admin information", 500));
    }
  }
);

interface IGoogleAuth {
  provider: string;
  code: string;
}

export const socialAuth = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { provider, code } = req.body as IGoogleAuth;

      if (provider !== 'google' || !code) {
        return next(new AppError('Google provider and code are required', 400));
      }

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!,
        `${process.env.FRONTEND_URL}/auth/callback`
      );

      let tokenResponse;
      try {
        tokenResponse = await oauth2Client.getToken(code);
      } catch (error: any) {
        console.error('Google code exchange error:', error);
        return next(new AppError('Invalid or expired Google code', 401));
      }

      const { id_token } = tokenResponse.tokens;
      if (!id_token) {
        return next(new AppError('Missing ID token from Google', 401));
      }

      let ticket;
      try {
        ticket = await oauth2Client.verifyIdToken({
          idToken: id_token,
          audience: process.env.GOOGLE_CLIENT_ID!,
        });
      } catch (error: any) {
        console.error('Google token verification error:', error);
        return next(new AppError('Invalid Google ID token', 401));
      }

      const payload = ticket.getPayload();
      if (!payload) {
        return next(new AppError('Invalid Google token payload', 401));
      }

      const { email, name, picture, sub } = payload;

      if (!email || !name) {
        return next(new AppError('Email and name are required from Google profile', 400));
      }

      const normalizedEmail = email.trim().toLowerCase();

      let user = await UserModel.findOne({ email: normalizedEmail });

      if (!user) {
        user = await UserModel.create({
          name: name.trim(),
          email: normalizedEmail,
          avatar: picture ? { public_id: `google_${sub}`, url: picture } : undefined,
          isVerified: true,
          role: 'user',
          socialAuthProvider: 'google',
          courses: [],
          preferences: [],
          recommendedCourses: [],
          courseProgress: [],
          interactionHistory: [],
        });
        console.log(`✅ New Google user created: ${normalizedEmail}`);
      } else if (user.socialAuthProvider !== 'google') {
        return next(new AppError('Account exists with a different provider', 400));
      }

      return await sendToken(user, 200, res);
    } catch (err: any) {
      console.error('❌ Google social auth error:', err);
      return next(new AppError(err.message || 'Google auth failed', 500));
    }
  }
);
interface IUpdateUserInterface {
  name: string;
  email: string;
}

export const UpdateUserInformation = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email } = req.body as IUpdateUserInterface;
      const userId = String(req.user?._id); // Ensure userId is a string
      const user = await UserModel.findById(userId);

      if (!user) {
        return next(new AppError("User not found", 404));
      }

      // Check if email already exists
      if (email) {
        const isEmailExisted = await UserModel.findOne({ email });
        if (isEmailExisted) {
          return next(new AppError("Email is already existed", 400));
        }
        user.email = email;
      }

      if (name) {
        user.name = name;
      }

      await user.save();

      // Store updated user data in Redis
      await client.set(userId, JSON.stringify(user));

      res.status(201).json({
        success: true,
        user,
      });
    } catch (err: any) {
      console.log(err.message, "error in UpdateUserinformation ");
      next(new AppError("error in updateUserInformatin", 400));
    }
  }
);

//   updatePassword

interface IUpdatePasswordInterface {
  currentPassword: string;
  newPassword: string;
}

export const UpdatePassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } =
        req.body as IUpdatePasswordInterface;
      if (!currentPassword || !newPassword) {
      }

      const user = await UserModel.findById(req.user?._id).select("password");
      if (!user) {
        return next(new AppError("User not found", 404));
      }

      const isPasswordMatch = await user.comparePassword(currentPassword);
      if (!isPasswordMatch) {
        return next(new AppError("Current password is incorrect", 400));
      }

      user.password = newPassword;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        success: false,
        message: "Error during password update",
      });
    }
  }
);

interface IUpateProfilePicture {
  avatar: {
    public_id: string;
    url: string;
  };
}

export const UpdateProfilePicture = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body as IUpateProfilePicture;
      const userId = req?.user?._id;

      const user = await UserModel.findById(userId);

      if (avatar && user) {
        // If the user already has an avatar, delete the old one
        if (user.avatar?.public_id) {
          await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        }

        // Upload the new avatar
        const myCloud = await cloudinary.v2.uploader.upload(String(avatar), {
          folder: "avatars",
          width: 150,
        });

        // Update the user's avatar field
        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };

        // Save user changes to the database
        await user.save();

        // Cache the updated user object
        await client.set(String(userId), JSON.stringify(user));
      }

      res.status(200).json({
        success: true,
        message: "Profile picture updated successfully",
        user,
      });
    } catch (err) {
      next(new AppError("Error in updating profile picture", 400));
    }
  }
);

export const getallUsers = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getalluserServices(res);
    } catch (error) {
      next(new AppError("this errror in getalluser", 400));
    }
  }
);

export const updateUserRoles = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, role } = req.body;
      UpdateUserRoleServices(res, id, role);
    } catch (error) {
      next(new AppError("this errror in updating user role", 400));
    }
  }
);

export const deleteUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Find user by ID
      const user = await UserModel.findById(id);
      if (!user) {
        return next(new AppError("User not found", 404));
      }

      // Delete the user
      await user.deleteOne();

      // Remove from Redis (if applicable)
      if (client) {
        client.del(id);
      }

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(new AppError("Error in deleteUser", 500));
    }
  }
);

export const adminLogin = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Login attempt with body:", req.body);
      const { email, password } = req.body as loginType;

      if (!email || !password) {
        console.log("Missing email or password");
        return next(new AppError("Please enter both email and password", 400));
      }

      console.log("Querying user with email:", email);
      const user = await UserModel.findOne({ email }).select("+password");
      console.log(
        "User found:",
        user ? { id: user._id, email: user.email, role: user.role } : null
      );
      if (!user) {
        return next(new AppError("Incorrect email or password", 401));
      }

      if (user.role !== "admin") {
        console.log("Non-admin user attempted login:", user.role);
        return next(
          new AppError(
            "This login is for admins only. Please use the user login.",
            403
          )
        );
      }

      console.log("Comparing password for user:", email);
      const isPasswordMatch = await user.comparePassword(password);
      console.log("Password match result:", isPasswordMatch);
      if (!isPasswordMatch) {
        return next(new AppError("Incorrect email or password", 401));
      }

      console.log("Calling sendToken for user:", user._id);
      return  sendToken(user, 200, res);
    } catch (err: any) {
      console.error("Error in admin login:", err.message, err.stack);
      return next(
        new AppError(`Error during admin login: ${err.message}`, 500)
      );
    }
  }
);

export const createAdmin = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      // Validate required fields
      if (!email || !password || !name) {
        return next(
          new AppError("All fields are required", 400, {
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
        return next(
          new AppError("Email already exists", 400, {
            path: "email",
            value: req.body.email,
          })
        );
      }

      // Create admin user with verified status
      const adminUser = await UserModel.create({
        name,
        email,
        password,
        role: "admin",
        isVerified: true, // Auto-verify admin users
      });

      res.status(201).json({
        success: true,
        message: "Admin user created successfully",
        user: {
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          isVerified: adminUser.isVerified,
        },
      });
    } catch (error: any) {
      console.error("Admin creation error:", error);
      return next(
        new AppError(error.message || "Failed to create admin user", 500)
      );
    }
  }
);

// For initial admin creation when no admin exists yet (to be used during setup)
export const createInitialAdmin = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if any admin exists in the system
      const adminExists = await UserModel.findOne({ role: "admin" });

      if (adminExists) {
        return next(
          new AppError(
            "Admin user already exists. Please use regular admin creation.",
            400
          )
        );
      }

      const { name, email, password, setupKey } = req.body;

      // Validate setup key from environment variable
      if (setupKey !== process.env.ADMIN_SETUP_KEY) {
        return next(new AppError("Invalid setup key", 403));
      }

      // Validate required fields
      if (!email || !password || !name) {
        return next(new AppError("All fields are required", 400));
      }

      // Create initial admin user
      const adminUser = await UserModel.create({
        name,
        email,
        password,
        role: "admin",
        isVerified: true,
      });

      res.status(201).json({
        success: true,
        message: "Initial admin user created successfully",
        user: {
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
        },
      });
    } catch (error: any) {
      console.error("Initial admin creation error:", error);
      return next(
        new AppError(error.message || "Failed to create initial admin", 500)
      );
    }
  }
);

export const forgetPassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      // Validate email input
      if (!email || typeof email !== "string" || !email.trim()) {
        return next(new AppError("Please provide a valid email", 400));
      }

      const normalizedEmail = email.trim().toLowerCase();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(normalizedEmail)) {
        return next(new AppError("Please provide a valid email address", 400));
      }

      // Find user by email
      const user = await UserModel.findOne({ email: normalizedEmail }).select(
        "+password"
      );

      // Always return a generic response to prevent email enumeration
      if (!user) {
        return res.status(200).json({
          success: true,
          message:
            "If an account exists with this email, a password reset email has been sent.",
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Set token and expiry on user
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      // Construct reset URL
      const resetUrl = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/auth/reset-password?token=${resetToken}`;

      // Prepare email template
      const emailData = {
        name: user.name,
        resetUrl,
        appName: "EduAI",
        supportEmail: process.env.SUPPORT_EMAIL || "support@eduai.com",
      };

      // Send reset email
      try {
        await sendEmail({
          email: user.email,
          subject: "Password Reset Request - EduAI",
          template: "password-reset.ejs",
          data: emailData,
        });
      } catch (emailError: any) {
        // Clear token if email fails
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        console.error("Email sending error:", emailError);
        return next(
          new AppError(
            "Failed to send password reset email. Please try again later.",
            500
          )
        );
      }

      res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset email has been sent.",
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      return next(
        new AppError(
          "An error occurred while processing your request. Please try again.",
          500
        )
      );
    }
  }
);

export const resetPassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;

      // Validate input
      if (!token || !newPassword) {
        return next(
          new AppError("Reset token and new password are required", 400)
        );
      }

      // Validate password
      if (typeof newPassword !== "string") {
        return next(new AppError("Password must be a string", 400));
      }

      if (newPassword.length < 6) {
        return next(
          new AppError("Password must be at least 6 characters long", 400)
        );
      }

      if (newPassword.length > 128) {
        return next(
          new AppError("Password must not exceed 128 characters", 400)
        );
      }

      // Optional: Add complexity check to match registration
      if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
          newPassword
        )
      ) {
        return next(
          new AppError(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            400
          )
        );
      }

      // Hash the provided token
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // Find user with valid token and non-expired reset period
      const user = await UserModel.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      }).select("+password");

      if (!user) {
        return next(new AppError("Invalid or expired reset token", 400));
      }

      // Update password and clear reset fields
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully. You can now log in.",
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      return next(
        new AppError(
          "An error occurred while resetting your password. Please try again.",
          500
        )
      );
    }
  }
);


// export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token = req.headers.authorization?.split('Bearer ')[1];
//     if (!token) {
//       return res.status(401).json({ success: false, message: 'No token provided' });
//     }

//     // Check if token exists in Redis
//     const session = await client.get(`session:${token}`);
//     if (!session) {
//       return res.status(401).json({ success: false, message: 'Invalid or expired token' });
//     }

//     res.status(200).json({ success: true, message: 'Token is valid' });
//   } catch (error) {
//     next(error);
//   }
// };