import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose, { Schema, Document, Model } from "mongoose";
import * as crypto from "crypto"; // Added for reset token generation
import "dotenv/config"; // Use ES module syntax for dotenv

// Interface for User, including progress and interaction tracking
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  preferences: string[]; // Array of user-selected topics
  recommendedCourses: Array<{ courseId: string; score: number }>; // Recommended courses
  resetPasswordToken?: string; // Added for password reset
  resetPasswordExpires?: Date; // Added for password reset

  // New fields for progress tracking
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
    action: string; // 'viewed', 'quiz-started', 'quiz-completed'
    section: string;
    timestamp: Date;
    duration: number;
  }>;

  // Methods for authentication and password comparison
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
  generateResetToken: () => string; // Added for password reset
}

// User Schema definition
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
      required: [true, "Please enter your password"],
      minlength: [8, "Password must be at least 8 characters"],
      validate: {
        validator: function (value: string) {
          return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
            value
          );
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
      select: false, // Don't return password in queries
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
      // Removed required to avoid conflict with default empty array
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
    resetPasswordToken: { type: String, select: false }, // Added for password reset
    resetPasswordExpires: { type: Date, select: false }, // Added for password reset
  },
  {
    timestamps: true,
  }
);

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
  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return resetToken;
};

// Hash Password Before Saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
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
    if (!this.password) throw new Error("Password not available");
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Export the User Model
const UserModel: Model<IUser> = mongoose.model("User", userSchema);

export default UserModel;