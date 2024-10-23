import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Gmail regex pattern for email validation
const gmailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

// Interface for avatar
interface IAvatar {
  public_id: string;
  url: string;
}

// User interface extending Document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: IAvatar;
  role: string;
  isVerified: boolean;
  courses: any[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

// Create the Mongoose schema with complete property definitions
const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    minlength: [3, "Name must be at least 3 characters"],
    maxlength: [30, "Name cannot exceed 30 characters"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: {
      validator: function(value: string) {
        return gmailRegex.test(value);
      },
      message: "Please enter a valid Gmail address"
    },
    lowercase: true,
    trim: true
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
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    }
  },
  avatar: {
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(value: string) {
          return /^https?:\/\/.+\..+/.test(value);
        },
        message: "Please provide a valid URL for avatar"
      }
    }
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  courses: {
    type: [Schema.Types.ObjectId], // Correct definition of array of Mixed types
    default: []
  },
  passwordResetToken: {
    type: String,
    default: undefined
  },
  passwordResetExpires: {
    type: Date,
    default: undefined
  },
  lastLogin: {
    type: Date,
    default: undefined
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
UserSchema.pre<IUser>("save", async function(next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

// Utility methods for course management
UserSchema.methods.addCourse = async function(courseData: any): Promise<void> {
  this.courses.push(courseData);
  await this.save();
};

UserSchema.methods.removeCourse = async function(courseIdentifier: any): Promise<void> {
  this.courses = this.courses.filter((course: any) => {
    return JSON.stringify(course) !== JSON.stringify(courseIdentifier);
  });
  await this.save();
};

UserSchema.methods.updateCourse = async function(courseIdentifier: any, newData: any): Promise<void> {
  const courseIndex = this.courses.findIndex((course: any) => {
    return JSON.stringify(course) === JSON.stringify(courseIdentifier);
  });

  if (courseIndex !== -1) {
    this.courses[courseIndex] = {
      ...this.courses[courseIndex],
      ...newData
    };
    await this.save();
  }
};

// Method to generate password reset token
UserSchema.methods.createPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetToken;
};

// Index for email field
UserSchema.index({ email: 1 });

const User = mongoose.model<IUser>("User", UserSchema);
export default User;

// Example usage types
export type CreateUserInput = Omit<IUser, 'courses' | 'comparePassword' | keyof Document>;
export type UpdateUserInput = Partial<CreateUserInput>;

// Helper type for course operations
export interface CourseOperations {
  addCourse(courseData: any): Promise<void>;
  removeCourse(courseIdentifier: any): Promise<void>;
  updateCourse(courseIdentifier: any, newData: any): Promise<void>;
}
