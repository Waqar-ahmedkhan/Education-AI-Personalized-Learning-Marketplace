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

// export const registerUser = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { name, email, password } = req.body as IRegistrationBody;

//       // Validate required fields
//       if (!email || !password || !name) {
//         return next(
//           new AppError("Validation failed", 400, {
//             errors: {
//               email: !email ? "Email is required" : undefined,
//               password: !password ? "Password is required" : undefined,
//               name: !name ? "Name is required" : undefined,
//             },
//           })
//         );
//       }

//       // Check email format
//       const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
//       if (!emailRegex.test(email)) {
//         return next(new AppError("Please provide a valid email address", 400));
//       }

//       // Check if email exists
//       const existingUser = await UserModel.findOne({ email });
//       if (existingUser) {
//         res.json({
//           status: "400",
//           message: "Email already exists",
//           path: "email",
//           value: req.body.email,
//         });
//         return next(
//           new AppError("Email already exists", 400, {
//             path: "email",
//             value: req.body.email,
//           })
//         );
//       }

//       // Create user input object
//       const userInput: IRegistrationBody = {
//         name,
//         email,
//         password,
//       };

//       // Generate activation token
//       let activationToken;
//       try {
//         activationToken = createActivationToken(userInput);
//       } catch (tokenError: any) {
//         console.error("Token creation error:", tokenError);
//         return next(
//           new AppError(
//             tokenError.message || "Failed to create activation token",
//             500
//           )
//         );
//       }

//       // Prepare email data
//       const emailData = {
//         user: { name: userInput.name },
//         activationCode: activationToken.activationCode,
//       };

//       try {
//         await sendEmail({
//           email: userInput.email,
//           subject: "Account Activation - EduAI",
//           template: "activation-code.ejs",
//           data: emailData,
//         });
//       } catch (emailError: any) {
//         console.error("Email sending error:", emailError);
//         return next(new AppError("Failed to send activation email", 500));
//       }

//       // Success response
//       return res.status(201).json({
//         success: true,
//         message:
//           "Registration successful! Please check your email for activation code.",
//         activationToken: activationToken.token,
//       });
//     } catch (error: any) {
//       console.error("Registration error:", error);
//       if (!res.headersSent) {
//         return next(new AppError(error.message || "Registration failed", 500));
//       }
//     }
//   }
// );

// export const activateUser = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { activation_token, activation_code } =
//         req.body as IActivationRequest;

//       // Verify the activation token
//       const decoded = jwt.verify(
//         activation_token,
//         process.env.ACTIVATION_SECRET as Secret
//       ) as { user: IRegistrationBody; activationCode: string };

//       // Verify activation code
//       if (decoded.activationCode !== activation_code) {
//         return next(new AppError("Invalid activation code", 400));
//       }

//       const { email, name, password } = decoded.user;

//       // Check if user already exists
//       const existingUser = await UserModel.findOne({ email });
//       if (existingUser) {
//         return next(new AppError("Email already exists", 400));
//       }

//       // Create the user
//       const user = await UserModel.create({
//         name,
//         email,
//         password,
//       });

//       res.status(201).json({
//         success: true,
//         message: "User activated successfully",
//         user,
//       });
//     } catch (error: any) {
//       console.error("Activation error:", error);
//       if (error.name === "JsonWebTokenError") {
//         return next(new AppError("Invalid activation token", 400));
//       }
//       if (error.name === "TokenExpiredError") {
//         return next(new AppError("Activation token has expired", 400));
//       }
//       return next(new AppError("Failed to activate user", 500));
//     }
//   }
// );

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
      try {
        await client.del(userId);
      } catch (err) {
        res.status(400).json({
          success: false,
          message: "error in redis",
        });
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
          return next(
            new AppError("Refresh token expired, please login again", 401)
          );
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

      req.user = user;

      // Set new cookies
      res.cookie("access_token", access_token, accessTokenOptions);
      res.cookie("refresh_token", new_refresh_token, refreshTokenOptions);

      await client.set(user._id, JSON.stringify(user), { EX: 6048000 });

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

interface ISoicalAuth {
  name: string;
  email: string;
  avatar: string;
}

export const socialAuth = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, avatar } = req.body as ISoicalAuth;
      if (!email || !name || !avatar) {
        return next(new AppError("Please provide all required fields", 400));
      }

      const user = await UserModel.create({ email, name, avatar });
      if (!user) {
        const newUser = await UserModel.create({ email, name, avatar });
        sendToken(newUser, 200, res);
      } else {
        sendToken(user, 200, res);
      }
    } catch (err) {
      console.log("error is not gooded");
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
