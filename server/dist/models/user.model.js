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
// src/models/user.model.ts
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
// Gmail regex pattern for email validation
const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
// Create the Mongoose schema
const UserSchema = new mongoose_1.Schema({
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
            validator: function (value) {
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
            validator: function (value) {
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                return passwordRegex.test(value);
            },
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
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
                validator: function (value) {
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
    courses: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Course",
            default: [],
        },
    ],
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Hash password before saving
UserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password")) {
            return next();
        }
        try {
            const salt = yield bcryptjs_1.default.genSalt(10);
            this.password = yield bcryptjs_1.default.hash(this.password, salt);
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
// Compare password method
UserSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield bcryptjs_1.default.compare(password, this.password);
        }
        catch (error) {
            throw new Error("Error comparing passwords");
        }
    });
};
// Generate password reset token
UserSchema.methods.generatePasswordResetToken =
    function () {
        return __awaiter(this, void 0, void 0, function* () {
            const resetToken = crypto_1.default.randomBytes(32).toString("hex");
            this.passwordResetToken = crypto_1.default
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");
            this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            yield this.save();
            return resetToken;
        });
    };
// Static login method
UserSchema.statics.login = function (email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield this.findOne({ email }).select("+password");
        if (!user) {
            throw new Error("Invalid email or password");
        }
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            throw new Error("Invalid email or password");
        }
        user.lastLogin = new Date();
        yield user.save();
        return user;
    });
};
const UserModel = mongoose_1.default.model("User", UserSchema);
exports.default = UserModel;
