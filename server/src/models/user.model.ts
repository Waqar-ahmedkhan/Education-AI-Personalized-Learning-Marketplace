import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose, { Schema, Document, Model } from "mongoose";
require("dotenv").config();

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
}

// User Schema definition
const userSchema = new Schema<IUser>({
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
    minlength: [6, "Password must be at least 6 characters"],
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
    required: [true, "Please specify a role"], // Made role required
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  courses: [{ courseId: { type: String, required: true } }],
  preferences: {
    type: [String],
    default: [],
    required: [true, "Please select at least one preference"], // Ensures at least one preference
  },
  recommendedCourses: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }, // Make courseId required
      score: { type: Number, default: 0, required: true }, // Ensure score is always present
    },
  ],
  
  // New fields for course progress and interaction history
  courseProgress: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      progress: Number,
      completedLessons: [String],
      lastAccessed: Date,
      quizScores: [
        {
          quizId: String,
          score: Number,
          attemptDate: Date,
        },
      ],
    },
  ],
  
  interactionHistory: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      action: String, // 'viewed', 'quiz-started', 'quiz-completed'
      section: String,
      timestamp: { type: Date, default: Date.now },
      duration: Number,
    },
  ],
}, {
  timestamps: true,
});

// Sign Access Token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m",
  });
};

// Sign Refresh Token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d",
  });
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

// Compare Passwords
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Export the User Model
const UserModel: Model<IUser> = mongoose.model("User", userSchema);

export default UserModel;





// import mongoose, { Document, Model, Schema } from "mongoose";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// require("dotenv").config();

// // Interface for user interactions with courses
// export interface IUserInteraction {
//   courseId: mongoose.Types.ObjectId;
//   action: string; // viewed, clicked, enrolled, completed, etc.
//   timestamp: Date;
//   duration?: number; // For time-based interactions
//   section?: string; // For section-specific interactions
// }

// // Enhanced User Interface
// export interface IUserInput extends Document {
//   name: string;
//   email: string;
//   password: string;
//   avatar: {
//     public_id: string;
//     url: string;
//   };
//   role: string;
//   isVerified: boolean;
//   courses: Array<{ courseId: mongoose.Types.ObjectId }>;
//   preferences: string[]; // Array of user-selected topics
//   recommendedCourses: Array<{
//     courseId: mongoose.Types.ObjectId;
//     score: number;
//     reason: string;
//     lastUpdated: Date;
//   }>;
//   courseProgress: Array<{
//     courseId: mongoose.Types.ObjectId;
//     progress: number;
//     lastAccessed: Date;
//     completedLessons: string[];
//     quizScores: Array<{
//       quizId: string;
//       score: number;
//       attemptDate: Date;
//     }>;
//   }>;
//   interests: Array<{
//     topic: string;
//     weight: number;
//     dateAdded: Date;
//   }>;
//   interactionHistory: Array<IUserInteraction>;
//   skillLevel: string;
//   comparePassword: (password: string) => Promise<boolean>;
//   SignAccessToken: () => string;
//   SignRefreshToken: () => string;
// }

// // Enhanced User Schema
// const userSchema = new Schema<IUserInput>(
//   {
//     name: {
//       type: String,
//       required: [true, "Please enter your name"],
//     },
//     email: {
//       type: String,
//       required: [true, "Please enter your email"],
//       unique: true,
//       index: true, // Added index for faster queries
//       validate: {
//         validator: function (value: string) {
//           return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value);
//         },
//         message: "Please enter a valid email",
//       },
//     },
//     password: {
//       type: String,
//       required: [true, "Please enter your password"],
//       minlength: [6, "Password must be at least 6 characters"],
//       select: false, // Prevents password from being returned in queries by default
//     },
//     avatar: {
//       public_id: {
//         type: String,
//         required: [true, "Please provide a public_id for the avatar"],
//       },
//       url: {
//         type: String,
//         required: [true, "Please provide a URL for the avatar"],
//       },
//     },
//     role: {
//       type: String,
//       enum: ["user", "admin", "instructor"], // Restrict to specific roles
//       default: "user",
//     },
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//     courses: [
//       {
//         courseId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Course",
//           required: true,
//         },
//       },
//     ],
//     preferences: {
//       type: [String],
//       default: [],
//     },
//     recommendedCourses: [
//       {
//         courseId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Course",
//         },
//         score: { type: Number, default: 0 },
//         reason: { type: String },
//         lastUpdated: { type: Date, default: Date.now },
//       },
//     ],
//     courseProgress: [
//       {
//         courseId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Course",
//         },
//         progress: { type: Number, default: 0 },
//         lastAccessed: { type: Date },
//         completedLessons: [{ type: String }],
//         quizScores: [
//           {
//             quizId: { type: String },
//             score: { type: Number },
//             attemptDate: { type: Date },
//           },
//         ],
//       },
//     ],
//     interests: [
//       {
//         topic: { type: String },
//         weight: { type: Number, default: 1 },
//         dateAdded: { type: Date, default: Date.now },
//       },
//     ],
//     interactionHistory: [
//       {
//         courseId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Course",
//         },
//         action: { type: String, required: true },
//         timestamp: { type: Date, default: Date.now },
//         duration: { type: Number },
//         section: { type: String },
//       },
//     ],
//     skillLevel: {
//       type: String,
//       enum: ["beginner", "intermediate", "advanced"],
//       default: "beginner",
//     },
//   },
//   {
//     timestamps: true, // Automatically adds createdAt and updatedAt fields
//   }
// );

// // Sign Access Token
// userSchema.methods.SignAccessToken = function () {
//   return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET as string, {
//     expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m", // Default to 15 minutes
//   });
// };

// // Sign Refresh Token
// userSchema.methods.SignRefreshToken = function () {
//   return jwt.sign(
//     { id: this._id },
//     process.env.REFRESH_TOKEN_SECRET as string,
//     {
//       expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d", // Default to 7 days
//     }
//   );
// };

// // Hash Password Before Saving
// userSchema.pre<IUserInput>("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }
//   try {
//     this.password = await bcrypt.hash(this.password, 10); // Hash with salt rounds = 10
//     next();
//   } catch (error: any) {
//     next(error);
//   }
// });

// // Compare Passwords
// userSchema.methods.comparePassword = async function (
//   password: string
// ): Promise<boolean> {
//   return bcrypt.compare(password, this.password);
// };

// // Export the User Model
// const UserModel: Model<IUserInput> = mongoose.model("User", userSchema);
// export default UserModel;