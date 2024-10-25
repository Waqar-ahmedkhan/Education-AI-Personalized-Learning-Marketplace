// src/models/user.model.ts
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Interface for avatar
interface IAvatar {
  public_id: string;
  url: string;
}

// Base user interface without Document methods
export interface IUserInput {
  name: string;
  email: string;
  password: string;
  avatar?: IAvatar;
  role?: string;
  isVerified?: boolean;
  courses?: mongoose.Types.ObjectId[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
}

// User interface extending Document
export interface IUser extends IUserInput, Document {
  comparePassword(password: string): Promise<boolean>;
  generatePasswordResetToken(): Promise<string>;
  _doc: any;
}

// Interface for the User Model
interface IUserModel extends Model<IUser> {
  login(email: string, password: string): Promise<IUser>;
}

// Gmail regex pattern for email validation
const gmailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

// Create the Mongoose schema
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [30, "Name cannot exceed 30 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: {
        validator: function(value: string) {
          return gmailRegex.test(value);
        },
        message: "Please enter a valid Gmail address",
      },
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
      validate: {
        validator: function(value: string) {
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return passwordRegex.test(value);
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
        validate: {
          validator: function(value: string) {
            return /^https?:\/\/.+\..+/.test(value);
          },
          message: "Please provide a valid URL for avatar",
        },
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [{
      type: Schema.Types.ObjectId,
      ref: "Course",
      default: [],
    }],
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
UserSchema.pre<IUser>("save", async function(next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(
  password: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = async function(): Promise<string> {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await this.save();

  return resetToken;
};

// Static login method
UserSchema.statics.login = async function(
  email: string,
  password: string
): Promise<IUser> {
  const user = await this.findOne({ email }).select("+password");
  
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  user.lastLogin = new Date();
  await user.save();

  return user;
};

const UserModel = mongoose.model<IUser, IUserModel>("User", UserSchema);

export default UserModel;