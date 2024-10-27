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
exports.updateAccessToken = exports.UserLogout = exports.UserLogin = exports.activateUser = exports.registerUser = exports.createActivationToken = void 0;
const CatchAsyncError_1 = require("../middlewares/CatchAsyncError");
const user_model_1 = __importDefault(require("../models/user.model"));
const AppError_1 = require("../utils/AppError");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Sendemail_1 = __importDefault(require("../utils/Sendemail"));
const jwt_1 = require("../utils/jwt");
const RedisConnect_1 = require("../utils/RedisConnect");
const createActivationToken = (user) => {
    if (!process.env.ACTIVATION_SECRET) {
        throw new Error("ACTIVATION_SECRET is not defined in environment variables");
    }
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jsonwebtoken_1.default.sign({
        user: {
            name: user.name,
            email: user.email,
            password: user.password,
        },
        activationCode,
    }, process.env.ACTIVATION_SECRET, { expiresIn: "5m" });
    return { token, activationCode };
};
exports.createActivationToken = createActivationToken;
exports.registerUser = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Validate required fields
        if (!email || !password || !name) {
            return next(new AppError_1.AppError("Validation failed", 400, {
                errors: {
                    email: !email ? "Email is required" : undefined,
                    password: !password ? "Password is required" : undefined,
                    name: !name ? "Name is required" : undefined,
                },
            }));
        }
        // Check email format
        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        if (!emailRegex.test(email)) {
            return next(new AppError_1.AppError("Please provide a valid email address", 400));
        }
        // Check if email exists
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            res.json({
                status: "400",
                message: "Email already exists",
                path: "email",
                value: req.body.email,
            });
            return next(new AppError_1.AppError("Email already exists", 400, {
                path: "email",
                value: req.body.email,
            }));
        }
        // Create user input object
        const userInput = {
            name,
            email,
            password,
        };
        // Generate activation token
        let activationToken;
        try {
            activationToken = (0, exports.createActivationToken)(userInput);
        }
        catch (tokenError) {
            console.error("Token creation error:", tokenError);
            return next(new AppError_1.AppError(tokenError.message || "Failed to create activation token", 500));
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
            console.error("Email sending error:", emailError);
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
        console.error("Registration error:", error);
        if (!res.headersSent) {
            return next(new AppError_1.AppError(error.message || "Registration failed", 500));
        }
    }
}));
exports.activateUser = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { activation_token, activation_code } = req.body;
        // Verify the activation token
        const decoded = jsonwebtoken_1.default.verify(activation_token, process.env.ACTIVATION_SECRET);
        // Verify activation code
        if (decoded.activationCode !== activation_code) {
            return next(new AppError_1.AppError("Invalid activation code", 400));
        }
        const { email, name, password } = decoded.user;
        // Check if user already exists
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            return next(new AppError_1.AppError("Email already exists", 400));
        }
        // Create the user
        const user = yield user_model_1.default.create({
            name,
            email,
            password,
        });
        res.status(201).json({
            success: true,
            message: "User activated successfully",
            user,
        });
    }
    catch (error) {
        console.error("Activation error:", error);
        if (error.name === "JsonWebTokenError") {
            return next(new AppError_1.AppError("Invalid activation token", 400));
        }
        if (error.name === "TokenExpiredError") {
            return next(new AppError_1.AppError("Activation token has expired", 400));
        }
        return next(new AppError_1.AppError("Failed to activate user", 500));
    }
}));
exports.UserLogin = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new AppError_1.AppError("Please enter both email and password", 400));
        }
        const user = yield user_model_1.default.findOne({ email }).select("+password");
        if (!user) {
            return next(new AppError_1.AppError("Incorrect email or password", 400));
        }
        const isPasswordMatch = yield user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new AppError_1.AppError("Incorrect email or password", 400));
        }
        // Generate and send tokens
        (0, jwt_1.sendToken)(user, 200, res);
    }
    catch (err) {
        console.log("Error in login:", err);
        res.status(400).json({
            success: false,
            message: "Error during login",
        });
    }
}));
// User Logout Controller
exports.UserLogout = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });
        // await client.del(req.user?.id);
        const userId = String((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        try {
            yield RedisConnect_1.client.del(userId);
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: "error in redis"
            });
        }
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: "Error during logout",
        });
    }
}));
exports.updateAccessToken = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refresh_token = req.cookies.refresh_token;
        if (!refresh_token) {
            return next(new AppError_1.AppError("Please login again", 401));
        }
        // Verify refresh token
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
        }
        catch (error) {
            if (error.name === "TokenExpiredError") {
                return next(new AppError_1.AppError("Refresh token expired, please login again", 401));
            }
            return next(new AppError_1.AppError("Invalid refresh token", 401));
        }
        // Get user from Redis
        const session = yield RedisConnect_1.client.get(decoded.id);
        if (!session) {
            return next(new AppError_1.AppError("Please login again", 401));
        }
        const user = JSON.parse(session);
        // Generate new access token
        const access_token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "8m" } // Set according to your environment variable
        );
        // Generate new refresh token
        const new_refresh_token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "4d" } // Set according to your environment variable
        );
        // Update session in Redis
        user.refresh_token = new_refresh_token; // Update refresh token
        yield RedisConnect_1.client.set(user._id, JSON.stringify(user));
        // Set new cookies
        res.cookie("access_token", access_token, jwt_1.accessTokenOptions);
        res.cookie("refresh_token", new_refresh_token, jwt_1.refreshTokenOptions);
        res.status(200).json({
            status: "success",
            access_token,
        });
    }
    catch (error) {
        console.error("Token refresh error:", error);
        return next(new AppError_1.AppError("Error refreshing access token", 500));
    }
}));
