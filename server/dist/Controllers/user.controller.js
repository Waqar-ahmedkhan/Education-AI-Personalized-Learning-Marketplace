"use strict";
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
exports.registerUser = exports.createActivationToken = void 0;
const CatchAsyncError_1 = require("../middlewares/CatchAsyncError");
const user_model_1 = __importDefault(require("../models/user.model"));
const AppError_1 = require("../utils/AppError");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Sendemail_1 = __importDefault(require("../utils/Sendemail"));
const createActivationToken = (user) => {
    if (!process.env.ACTIVATION_SECRET) {
        throw new Error('ACTIVATION_SECRET is not defined in environment variables');
    }
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jsonwebtoken_1.default.sign({
        email: user.email,
        activationCode,
    }, process.env.ACTIVATION_SECRET, { expiresIn: "5m" });
    return { token, activationCode };
};
exports.createActivationToken = createActivationToken;
exports.registerUser = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Log the request body for debugging
        const { name, email, password } = req.body;
        // Validate required fields
        if (!email || !password || !name) {
            return next(new AppError_1.AppError("Please provide all required fields", 400));
        }
        // Check email format
        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        if (!emailRegex.test(email)) {
            return next(new AppError_1.AppError("Please provide a valid email address", 400));
        }
        // Check if email exists
        const existingUser = yield user_model_1.default.findOne({ email }).select('+email');
        if (existingUser) {
            return next(new AppError_1.AppError("Email already exists", 400));
        }
        // Create user input object
        const userInput = {
            name,
            email,
            password,
            // isVerified: false,
            // role: "user"
        };
        // Generate activation token
        let activationToken;
        try {
            activationToken = (0, exports.createActivationToken)(userInput);
        }
        catch (tokenError) {
            console.error('Token creation error:', tokenError);
            return next(new AppError_1.AppError(tokenError.message || "Failed to create activation token", 500));
        }
        // Create new user
        let newUser;
        try {
            // newUser = await UserModel.create(userInput);
        }
        catch (userError) {
            console.error('User creation error:', userError);
            if (userError.code === 11000) {
                return next(new AppError_1.AppError("Email already exists", 400));
            }
            return next(new AppError_1.AppError(userError.message || "Error creating user", 500));
        }
        // Prepare email data
        const emailData = {
            user: { name: userInput.name },
            activationCode: activationToken.activationCode,
        };
        try {
            yield (0, Sendemail_1.default)({
                email: userInput.email,
                subject: "Account Activation - EduAI",
                template: "activation-code.ejs",
                data: emailData,
            });
        }
        catch (emailError) {
            // If email fails, delete the created user
            // if (newUser) {
            //   await UserModel.findByIdAndDelete(newUser._id);
            // }
            console.error('Email sending error:', emailError);
            return next(new AppError_1.AppError("Failed to send activation email", 500));
        }
        // Success response
        return res.status(201).json({
            success: true,
            message: "Registration successful! Please check your email for activation code.",
            activationToken: activationToken.token,
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        // Ensure we don't send multiple responses
        if (!res.headersSent) {
            return next(new AppError_1.AppError(error.message || "Registration failed", 500));
        }
    }
}));
