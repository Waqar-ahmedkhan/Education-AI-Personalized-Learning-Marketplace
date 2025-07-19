import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose, { Schema, Document, Model } from "mongoose";
import * as crypto from "crypto";
import "dotenv/config";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string; // Made optional for social auth
  avatar?: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  preferences: string[];
  recommendedCourses: Array<{ courseId: string; score: number }>;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  socialAuthProvider?: "google" | "facebook" | "github"; // Track social auth provider
  courseProgress: Array<{
    courseId: mongoose.Types.ObjectId;
    progress: number;
    completedLessons: string[];
    lastAccessed: Date;
    quizScores: Array<{
      quizId: string;
      score: number;
      attemptDate: Date;
    }>;
  }>;
  interactionHistory: Array<{
    courseId: mongoose.Types.ObjectId;
    action: string;
    section: string;
    timestamp: Date;
    duration: number;
  }>;
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
  generateResetToken: () => string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, "Please enter your name"] },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: {
        validator: function (value: string) {
          return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value);
        },
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      required: [
        function () {
          return !this.socialAuthProvider; // Password required only if no social auth provider
        },
        "Please enter your password",
      ],
      minlength: [8, "Password must be at least 8 characters"],
      validate: {
        validator: function (value: string) {
          return value
            ? /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
                value
              )
            : true; // Skip validation if password is undefined
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
      select: false,
    },
    avatar: {
      public_id: { type: String, required: false },
      url: { type: String, required: false },
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "instructor"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [{ courseId: { type: String, required: true } }],
    preferences: {
      type: [String],
      default: [],
    },
    recommendedCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        score: { type: Number, default: 0, required: true },
      },
    ],
    courseProgress: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        progress: { type: Number, required: true, min: 0, max: 100 },
        completedLessons: [String],
        lastAccessed: { type: Date, default: Date.now },
        quizScores: [
          {
            quizId: { type: String, required: true },
            score: { type: Number, required: true, min: 0, max: 100 },
            attemptDate: { type: Date, default: Date.now },
          },
        ],
      },
    ],
    interactionHistory: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        action: {
          type: String,
          enum: ["viewed", "quiz-started", "quiz-completed"],
          required: true,
        },
        section: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        duration: { type: Number, required: true, min: 0 },
      },
    ],
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    socialAuthProvider: {
      type: String,
      enum: ["google", "facebook", "github"],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash Password Before Saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Prevent Role Change After Creation
userSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("role") && !this.isNew) {
    return next(new Error("Role cannot be changed after creation"));
  }
  next();
});

// Compare Passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    if (!this.password) return false; // No password for social auth users
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Sign Access Token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m",
    }
  );
};

// Sign Refresh Token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d",
    }
  );
};

// Generate Reset Token
userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

// Export the User Model
const UserModel: Model<IUser> = mongoose.model("User", userSchema);

export default UserModel;