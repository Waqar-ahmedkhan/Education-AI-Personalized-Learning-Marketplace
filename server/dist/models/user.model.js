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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importStar(require("mongoose"));
const crypto = __importStar(require("crypto"));
require("dotenv/config");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: [true, "Please enter your name"] },
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
        required: [
            function () {
                return !this.socialAuthProvider; // Password required only if no social auth provider
            },
            "Please enter your password",
        ],
        minlength: [8, "Password must be at least 8 characters"],
        validate: {
            validator: function (value) {
                return value
                    ? /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)
                    : true; // Skip validation if password is undefined
            },
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
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
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Course",
                required: true,
            },
            score: { type: Number, default: 0, required: true },
        },
    ],
    courseProgress: [
        {
            courseId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Course" },
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
            courseId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Course" },
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
}, {
    timestamps: true,
});
// Hash Password Before Saving
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password") || !this.password) {
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
// Prevent Role Change After Creation
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("role") && !this.isNew) {
            return next(new Error("Role cannot be changed after creation"));
        }
        next();
    });
});
// Compare Passwords
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!this.password)
                return false; // No password for social auth users
            return yield bcryptjs_1.default.compare(candidatePassword, this.password);
        }
        catch (error) {
            throw new Error("Password comparison failed");
        }
    });
};
// Sign Access Token
userSchema.methods.SignAccessToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id, role: this.role }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m",
    });
};
// Sign Refresh Token
userSchema.methods.SignRefreshToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id, role: this.role }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d",
    });
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
const UserModel = mongoose_1.default.model("User", userSchema);
exports.default = UserModel;
