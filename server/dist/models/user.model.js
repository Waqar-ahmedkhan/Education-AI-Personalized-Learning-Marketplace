"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
// User Schema definition
// Enhanced User Schema
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: {
            validator: function (value) {
                return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value);
            },
            message: "Please enter a valid email",
        },
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    avatar: {
        public_id: String,
        url: String,
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
    courses: [
        {
            courseId: { type: String, required: true },
        },
    ],
    preferences: {
        type: [String],
        default: [], // User's topic preferences
    },
    recommendedCourses: [
        {
            courseId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Course" },
            score: { type: Number, default: 0 }, // Recommendation score
        },
    ],
}, {
    timestamps: true,
});
// Sign Access Token
userSchema.methods.SignAccessToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m",
    });
};
// Sign Refresh Token
userSchema.methods.SignRefreshToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d" });
};
// Hash Password Before Saving
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password")) {
            return next();
        }
        try {
            this.password = yield bcryptjs_1.default.hash(this.password, 10);
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
// Compare Passwords
userSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcryptjs_1.default.compare(password, this.password);
    });
};
// Export the User Model
const UserModel = mongoose_1.default.model("User", userSchema);
exports.default = UserModel;
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
