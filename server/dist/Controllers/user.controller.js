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
exports.resetPassword = exports.forgetPassword = exports.createInitialAdmin = exports.createAdmin = exports.adminLogin = exports.deleteUser = exports.updateUserRoles = exports.getallUsers = exports.UpdateProfilePicture = exports.UpdatePassword = exports.UpdateUserInformation = exports.socialAuth = exports.getAdminInfo = exports.getUserInformatin = exports.updateAccessToken = exports.UserLogout = exports.UserLogin = exports.activateUser = exports.registerUser = exports.createActivationToken = void 0;
const CatchAsyncError_1 = require("../middlewares/CatchAsyncError");
const user_model_1 = __importDefault(require("../models/user.model"));
const AppError_1 = require("../utils/AppError");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Sendemail_1 = __importDefault(require("../utils/Sendemail"));
const jwt_1 = require("../utils/jwt");
const RedisConnect_1 = require("../utils/RedisConnect");
const user_services_1 = require("../services/user.services");
const cloudinary_1 = __importDefault(require("cloudinary"));
const crypto = __importStar(require("crypto"));
const google_auth_library_1 = require("google-auth-library");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleapis_1 = require("googleapis");
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
        // Comprehensive validation with detailed error messages
        const validationErrors = {};
        // Name validation
        if (!name || typeof name !== "string") {
            validationErrors.name = "Name is required";
        }
        else if (name.trim().length < 2) {
            validationErrors.name = "Name must be at least 2 characters long";
        }
        else if (name.trim().length > 50) {
            validationErrors.name = "Name must not exceed 50 characters";
        }
        else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
            validationErrors.name = "Name can only contain letters and spaces";
        }
        // Email validation
        if (!email || typeof email !== "string") {
            validationErrors.email = "Email is required";
        }
        else {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email.trim().toLowerCase())) {
                validationErrors.email = "Please provide a valid email address";
            }
            else if (email.length > 100) {
                validationErrors.email = "Email must not exceed 100 characters";
            }
        }
        // Password validation
        if (!password || typeof password !== "string") {
            validationErrors.password = "Password is required";
        }
        else if (password.length < 8) {
            validationErrors.password =
                "Password must be at least 8 characters long";
        }
        else if (password.length > 128) {
            validationErrors.password = "Password must not exceed 128 characters";
        }
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
            validationErrors.password =
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
        }
        // Return validation errors if any
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors,
            });
        }
        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();
        // Check if user already exists
        let existingUser;
        try {
            existingUser = yield user_model_1.default.findOne({
                email: normalizedEmail,
            }).select("email");
        }
        catch (dbError) {
            console.error("Database query error:", dbError);
            return res.status(500).json({
                success: false,
                message: "Database connection error. Please try again later.",
            });
        }
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists",
                errors: {
                    email: "This email is already registered. Please use a different email or try logging in.",
                },
            });
        }
        // Create user input object
        const userInput = {
            name: trimmedName,
            email: normalizedEmail,
            password: password, // Keep original password for hashing
        };
        // Generate activation token with error handling
        let activationToken;
        try {
            activationToken = (0, exports.createActivationToken)(userInput);
            // Validate token creation
            if (!activationToken ||
                !activationToken.token ||
                !activationToken.activationCode) {
                throw new Error("Invalid token structure generated");
            }
        }
        catch (tokenError) {
            console.error("Token creation error:", tokenError);
            return res.status(500).json({
                success: false,
                message: "Failed to generate activation code. Please try again.",
            });
        }
        // Prepare email data with proper structure
        const emailData = {
            user: {
                name: userInput.name,
                email: userInput.email,
            },
            activationCode: activationToken.activationCode,
            appName: "EduAI",
            supportEmail: process.env.SUPPORT_EMAIL || "support@eduai.com",
        };
        // Send activation email with comprehensive error handling
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
            // Different error messages based on email error type
            let emailErrorMessage = "Failed to send activation email";
            if (emailError.code === "ENOTFOUND") {
                emailErrorMessage = "Email service temporarily unavailable";
            }
            else if (emailError.responseCode === 550) {
                emailErrorMessage = "Invalid email address provided";
            }
            else if (emailError.responseCode === 554) {
                emailErrorMessage = "Email rejected by recipient server";
            }
            return res.status(500).json({
                success: false,
                message: `${emailErrorMessage}. Please try again or contact support.`,
            });
        }
        // Log successful registration (without sensitive data)
        console.log(`User registration initiated for email: ${userInput.email}`);
        // Success response
        return res.status(201).json({
            success: true,
            message: "Registration successful! Please check your email for the activation code.",
            activationToken: activationToken.token,
            data: {
                email: userInput.email,
                name: userInput.name,
            },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        // Ensure headers aren't already sent
        if (res.headersSent) {
            return;
        }
        // Handle different types of errors
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Validation error occurred",
                errors: error.errors,
            });
        }
        if (error.name === "MongoError" || error.name === "MongooseError") {
            return res.status(500).json({
                success: false,
                message: "Database error. Please try again later.",
            });
        }
        // Generic error response
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
}));
exports.activateUser = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { activation_token, activation_code } = req.body;
        // Validate input
        if (!activation_token) {
            return res.status(400).json({
                success: false,
                message: "Activation link is invalid or expired. Please request a new activation code.",
                errorCode: "MISSING_TOKEN",
            });
        }
        if (!activation_code) {
            return res.status(400).json({
                success: false,
                message: "Please enter the 4-digit activation code sent to your email.",
                errorCode: "MISSING_CODE",
            });
        }
        // Validate activation code format
        if (!/^\d{4}$/.test(activation_code.trim())) {
            return res.status(400).json({
                success: false,
                message: "Activation code must be exactly 4 digits. Please check your email for the correct code.",
                errorCode: "INVALID_CODE_FORMAT",
            });
        }
        let decoded;
        try {
            // Verify the activation token
            decoded = jsonwebtoken_1.default.verify(activation_token, process.env.ACTIVATION_SECRET);
        }
        catch (jwtError) {
            console.error("JWT verification error:", jwtError);
            if (jwtError.name === "TokenExpiredError") {
                return res.status(400).json({
                    success: false,
                    message: "Your activation code has expired. Please request a new activation code to continue.",
                    errorCode: "TOKEN_EXPIRED",
                    action: "REQUEST_NEW_CODE",
                });
            }
            if (jwtError.name === "JsonWebTokenError") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid activation link. Please use the latest activation email or request a new code.",
                    errorCode: "INVALID_TOKEN",
                    action: "REQUEST_NEW_CODE",
                });
            }
            return res.status(400).json({
                success: false,
                message: "Activation link is corrupted or invalid. Please request a new activation code.",
                errorCode: "TOKEN_ERROR",
                action: "REQUEST_NEW_CODE",
            });
        }
        // Verify activation code matches
        if (decoded.activationCode !== activation_code.trim()) {
            return res.status(400).json({
                success: false,
                message: "The activation code you entered is incorrect. Please check your email and try again.",
                errorCode: "CODE_MISMATCH",
                action: "RETRY_CODE",
            });
        }
        const { email, name, password } = decoded.user;
        // Validate decoded user data
        if (!email || !name || !password) {
            return res.status(400).json({
                success: false,
                message: "Activation data is incomplete. Please register again or contact support.",
                errorCode: "INCOMPLETE_DATA",
                action: "REGISTER_AGAIN",
            });
        }
        try {
            // Check if user already exists
            const existingUser = yield user_model_1.default.findOne({ email });
            if (existingUser) {
                // Check if user is already verified
                if (existingUser.isVerified) {
                    return res.status(400).json({
                        success: false,
                        message: "This account is already activated. You can log in directly.",
                        errorCode: "ALREADY_ACTIVATED",
                        action: "GO_TO_LOGIN",
                    });
                }
                else {
                    // User exists but not verified, update verification status
                    existingUser.isVerified = true;
                    yield existingUser.save();
                    return res.status(200).json({
                        success: true,
                        message: "Account activated successfully! You can now log in.",
                        user: {
                            name: existingUser.name,
                            email: existingUser.email,
                            role: existingUser.role,
                            isVerified: existingUser.isVerified,
                        },
                    });
                }
            }
            // Create new user
            const user = yield user_model_1.default.create({
                name,
                email,
                password,
                isVerified: true, // Set as verified since they completed activation
            });
            res.status(201).json({
                success: true,
                message: "Account activated successfully! Welcome aboard. You can now log in.",
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified,
                },
            });
        }
        catch (dbError) {
            console.error("Database error during activation:", dbError);
            if (dbError.code === 11000) {
                // MongoDB duplicate key error
                return res.status(400).json({
                    success: false,
                    message: "An account with this email already exists. Try logging in instead.",
                    errorCode: "DUPLICATE_EMAIL",
                    action: "GO_TO_LOGIN",
                });
            }
            return res.status(500).json({
                success: false,
                message: "We're having trouble activating your account right now. Please try again in a few minutes.",
                errorCode: "DATABASE_ERROR",
                action: "RETRY_LATER",
            });
        }
    }
    catch (error) {
        console.error("Unexpected activation error:", error);
        // Handle specific known errors
        if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes("validation")) {
            return res.status(400).json({
                success: false,
                message: "The information provided is not valid. Please check and try again.",
                errorCode: "VALIDATION_ERROR",
            });
        }
        if (((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes("network")) ||
            ((_c = error.message) === null || _c === void 0 ? void 0 : _c.includes("timeout"))) {
            return res.status(500).json({
                success: false,
                message: "Network issue detected. Please check your connection and try again.",
                errorCode: "NETWORK_ERROR",
                action: "RETRY",
            });
        }
        // Generic error
        return res.status(500).json({
            success: false,
            message: "Something went wrong while activating your account. Please try again or contact support if the problem persists.",
            errorCode: "INTERNAL_ERROR",
            action: "RETRY_OR_CONTACT_SUPPORT",
        });
    }
}));
exports.UserLogin = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return next(new AppError_1.AppError("Please enter both email and password", 400));
        }
        // Find user and select password
        const user = yield user_model_1.default.findOne({ email }).select("+password");
        if (!user) {
            return next(new AppError_1.AppError("Email not found", 401));
        }
        // Check role
        if (user.role !== "user") {
            return next(new AppError_1.AppError("This login is for users only. Please use the admin login.", 403));
        }
        // Compare password
        const isPasswordMatch = yield user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new AppError_1.AppError("Incorrect password", 401));
        }
        // Send token only if all checks pass
        (0, jwt_1.sendToken)(user, 200, res);
    }
    catch (err) {
        console.error("Error in user login:", err);
        // Ensure no response is sent before this point
        return next(new AppError_1.AppError(err.message || "Error during user login", 500));
    }
}));
// User Logout Controller
exports.UserLogout = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            return next(new AppError_1.AppError("User not authenticated", 401));
        }
        res.cookie("access_token", "", {
            maxAge: 1,
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "lax",
        });
        res.cookie("refresh_token", "", {
            maxAge: 1,
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "lax",
        });
        const userId = String(req.user._id);
        try {
            yield RedisConnect_1.client.del(userId);
        }
        catch (err) {
            console.error(`Redis error during logout for user ${userId}:`, err);
            return res.status(500).json({
                success: false,
                message: "Error clearing session in Redis",
            });
        }
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (err) {
        console.error("Logout error:", err);
        return next(new AppError_1.AppError("Error during logout", 500));
    }
}));
exports.updateAccessToken = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refresh_token = req.cookies.refresh_token;
        if (!refresh_token) {
            return next(new AppError_1.AppError('Please login again', 401));
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
        }
        catch (error) {
            return next(new AppError_1.AppError(error.name === 'TokenExpiredError'
                ? 'Refresh token expired, please login again'
                : 'Invalid refresh token', 401));
        }
        let user = yield RedisConnect_1.client.get(decoded.id);
        if (!user) {
            const dbUser = yield user_model_1.default.findById(decoded.id).select('name email role isVerified courses courseProgress');
            if (!dbUser)
                return next(new AppError_1.AppError('User not found', 401));
            user = JSON.stringify(dbUser);
            yield RedisConnect_1.client.set(decoded.id, user, { EX: 7 * 24 * 60 * 60 });
        }
        const parsedUser = JSON.parse(user);
        const access_token = jsonwebtoken_1.default.sign({ id: parsedUser._id, role: parsedUser.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '70m' });
        const new_refresh_token = jsonwebtoken_1.default.sign({ id: parsedUser._id, role: parsedUser.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '90m' });
        res.cookie('access_token', access_token, jwt_1.accessTokenOptions);
        res.cookie('refresh_token', new_refresh_token, jwt_1.refreshTokenOptions);
        yield RedisConnect_1.client.set(parsedUser._id, JSON.stringify(Object.assign(Object.assign({}, parsedUser), { refresh_token: new_refresh_token })), { EX: 7 * 24 * 60 * 60 });
        res.status(200).json({
            success: true,
            accessToken: access_token,
            user: {
                _id: parsedUser._id,
                name: parsedUser.name,
                email: parsedUser.email,
                role: parsedUser.role,
                isVerified: parsedUser.isVerified,
                avatar: parsedUser.avatar,
            },
        });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        return next(new AppError_1.AppError('Error refreshing access token', 500));
    }
}));
const getUserInformatin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = String((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        (0, user_services_1.getUserbyId)(userId, res);
    }
    catch (err) {
        console.log("Error in get user information:", err);
        res.status(400).json({
            success: false,
            message: "Error during get user information",
        });
    }
});
exports.getUserInformatin = getUserInformatin;
exports.getAdminInfo = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = String((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        if (!userId) {
            return next(new AppError_1.AppError("User ID not found in token", 401));
        }
        const user = yield user_model_1.default.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires");
        if (!user) {
            return next(new AppError_1.AppError("User not found", 404));
        }
        if (user.role !== "admin") {
            return next(new AppError_1.AppError("Access denied: Admin role required", 403));
        }
        res.status(200).json({
            success: true,
            user: {
                _id: String(user._id), // safe and readable
                name: user.name,
                role: user.role,
                email: user.email,
                isVerified: user.isVerified,
            },
        });
    }
    catch (error) {
        console.error("Error in getAdminInfo:", error);
        return next(new AppError_1.AppError("Failed to fetch admin information", 500));
    }
}));
exports.socialAuth = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { provider, code } = req.body;
        if (provider !== 'google' || !code) {
            return next(new AppError_1.AppError('Google provider and code are required', 400));
        }
        const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${process.env.FRONTEND_URL}/auth/callback`);
        let tokenResponse;
        try {
            tokenResponse = yield oauth2Client.getToken(code);
        }
        catch (error) {
            console.error('Google code exchange error:', error);
            return next(new AppError_1.AppError('Invalid or expired Google code', 401));
        }
        const { id_token } = tokenResponse.tokens;
        if (!id_token) {
            return next(new AppError_1.AppError('Missing ID token from Google', 401));
        }
        let ticket;
        try {
            ticket = yield oauth2Client.verifyIdToken({
                idToken: id_token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
        }
        catch (error) {
            console.error('Google token verification error:', error);
            return next(new AppError_1.AppError('Invalid Google ID token', 401));
        }
        const payload = ticket.getPayload();
        if (!payload) {
            return next(new AppError_1.AppError('Invalid Google token payload', 401));
        }
        const { email, name, picture, sub } = payload;
        if (!email || !name) {
            return next(new AppError_1.AppError('Email and name are required from Google profile', 400));
        }
        const normalizedEmail = email.trim().toLowerCase();
        let user = yield user_model_1.default.findOne({ email: normalizedEmail });
        if (!user) {
            user = yield user_model_1.default.create({
                name: name.trim(),
                email: normalizedEmail,
                avatar: picture ? { public_id: `google_${sub}`, url: picture } : undefined,
                isVerified: true,
                role: 'user',
                socialAuthProvider: 'google',
                courses: [],
                preferences: [],
                recommendedCourses: [],
                courseProgress: [],
                interactionHistory: [],
            });
            console.log(`✅ New Google user created: ${normalizedEmail}`);
        }
        else if (user.socialAuthProvider !== 'google') {
            return next(new AppError_1.AppError('Account exists with a different provider', 400));
        }
        return yield (0, jwt_1.sendToken)(user, 200, res);
    }
    catch (err) {
        console.error('❌ Google social auth error:', err);
        return next(new AppError_1.AppError(err.message || 'Google auth failed', 500));
    }
}));
exports.UpdateUserInformation = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, email } = req.body;
        const userId = String((_a = req.user) === null || _a === void 0 ? void 0 : _a._id); // Ensure userId is a string
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return next(new AppError_1.AppError("User not found", 404));
        }
        // Check if email already exists
        if (email) {
            const isEmailExisted = yield user_model_1.default.findOne({ email });
            if (isEmailExisted) {
                return next(new AppError_1.AppError("Email is already existed", 400));
            }
            user.email = email;
        }
        if (name) {
            user.name = name;
        }
        yield user.save();
        // Store updated user data in Redis
        yield RedisConnect_1.client.set(userId, JSON.stringify(user));
        res.status(201).json({
            success: true,
            user,
        });
    }
    catch (err) {
        console.log(err.message, "error in UpdateUserinformation ");
        next(new AppError_1.AppError("error in updateUserInformatin", 400));
    }
}));
exports.UpdatePassword = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
        }
        const user = yield user_model_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select("password");
        if (!user) {
            return next(new AppError_1.AppError("User not found", 404));
        }
        const isPasswordMatch = yield user.comparePassword(currentPassword);
        if (!isPasswordMatch) {
            return next(new AppError_1.AppError("Current password is incorrect", 400));
        }
        user.password = newPassword;
        yield user.save();
        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: "Error during password update",
        });
    }
}));
exports.UpdateProfilePicture = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { avatar } = req.body;
        const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
        const user = yield user_model_1.default.findById(userId);
        if (avatar && user) {
            // If the user already has an avatar, delete the old one
            if ((_b = user.avatar) === null || _b === void 0 ? void 0 : _b.public_id) {
                yield cloudinary_1.default.v2.uploader.destroy(user.avatar.public_id);
            }
            // Upload the new avatar
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(String(avatar), {
                folder: "avatars",
                width: 150,
            });
            // Update the user's avatar field
            user.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
            // Save user changes to the database
            yield user.save();
            // Cache the updated user object
            yield RedisConnect_1.client.set(String(userId), JSON.stringify(user));
        }
        res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            user,
        });
    }
    catch (err) {
        next(new AppError_1.AppError("Error in updating profile picture", 400));
    }
}));
exports.getallUsers = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, user_services_1.getalluserServices)(res);
    }
    catch (error) {
        next(new AppError_1.AppError("this errror in getalluser", 400));
    }
}));
exports.updateUserRoles = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.body;
        (0, user_services_1.UpdateUserRoleServices)(res, id, role);
    }
    catch (error) {
        next(new AppError_1.AppError("this errror in updating user role", 400));
    }
}));
exports.deleteUser = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Find user by ID
        const user = yield user_model_1.default.findById(id);
        if (!user) {
            return next(new AppError_1.AppError("User not found", 404));
        }
        // Delete the user
        yield user.deleteOne();
        // Remove from Redis (if applicable)
        if (RedisConnect_1.client) {
            RedisConnect_1.client.del(id);
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    }
    catch (error) {
        next(new AppError_1.AppError("Error in deleteUser", 500));
    }
}));
exports.adminLogin = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Login attempt with body:", req.body);
        const { email, password } = req.body;
        if (!email || !password) {
            console.log("Missing email or password");
            return next(new AppError_1.AppError("Please enter both email and password", 400));
        }
        console.log("Querying user with email:", email);
        const user = yield user_model_1.default.findOne({ email }).select("+password");
        console.log("User found:", user ? { id: user._id, email: user.email, role: user.role } : null);
        if (!user) {
            return next(new AppError_1.AppError("Incorrect email or password", 401));
        }
        if (user.role !== "admin") {
            console.log("Non-admin user attempted login:", user.role);
            return next(new AppError_1.AppError("This login is for admins only. Please use the user login.", 403));
        }
        console.log("Comparing password for user:", email);
        const isPasswordMatch = yield user.comparePassword(password);
        console.log("Password match result:", isPasswordMatch);
        if (!isPasswordMatch) {
            return next(new AppError_1.AppError("Incorrect email or password", 401));
        }
        console.log("Calling sendToken for user:", user._id);
        return (0, jwt_1.sendToken)(user, 200, res);
    }
    catch (err) {
        console.error("Error in admin login:", err.message, err.stack);
        return next(new AppError_1.AppError(`Error during admin login: ${err.message}`, 500));
    }
}));
exports.createAdmin = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Validate required fields
        if (!email || !password || !name) {
            return next(new AppError_1.AppError("All fields are required", 400, {
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
            return next(new AppError_1.AppError("Email already exists", 400, {
                path: "email",
                value: req.body.email,
            }));
        }
        // Create admin user with verified status
        const adminUser = yield user_model_1.default.create({
            name,
            email,
            password,
            role: "admin",
            isVerified: true, // Auto-verify admin users
        });
        res.status(201).json({
            success: true,
            message: "Admin user created successfully",
            user: {
                _id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role,
                isVerified: adminUser.isVerified,
            },
        });
    }
    catch (error) {
        console.error("Admin creation error:", error);
        return next(new AppError_1.AppError(error.message || "Failed to create admin user", 500));
    }
}));
// For initial admin creation when no admin exists yet (to be used during setup)
exports.createInitialAdmin = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if any admin exists in the system
        const adminExists = yield user_model_1.default.findOne({ role: "admin" });
        if (adminExists) {
            return next(new AppError_1.AppError("Admin user already exists. Please use regular admin creation.", 400));
        }
        const { name, email, password, setupKey } = req.body;
        // Validate setup key from environment variable
        if (setupKey !== process.env.ADMIN_SETUP_KEY) {
            return next(new AppError_1.AppError("Invalid setup key", 403));
        }
        // Validate required fields
        if (!email || !password || !name) {
            return next(new AppError_1.AppError("All fields are required", 400));
        }
        // Create initial admin user
        const adminUser = yield user_model_1.default.create({
            name,
            email,
            password,
            role: "admin",
            isVerified: true,
        });
        res.status(201).json({
            success: true,
            message: "Initial admin user created successfully",
            user: {
                _id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role,
            },
        });
    }
    catch (error) {
        console.error("Initial admin creation error:", error);
        return next(new AppError_1.AppError(error.message || "Failed to create initial admin", 500));
    }
}));
exports.forgetPassword = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Validate email input
        if (!email || typeof email !== "string" || !email.trim()) {
            return next(new AppError_1.AppError("Please provide a valid email", 400));
        }
        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(normalizedEmail)) {
            return next(new AppError_1.AppError("Please provide a valid email address", 400));
        }
        // Find user by email
        const user = yield user_model_1.default.findOne({ email: normalizedEmail }).select("+password");
        // Always return a generic response to prevent email enumeration
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, a password reset email has been sent.",
            });
        }
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        // Set token and expiry on user
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        yield user.save();
        // Construct reset URL
        const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`;
        // Prepare email template
        const emailData = {
            name: user.name,
            resetUrl,
            appName: "EduAI",
            supportEmail: process.env.SUPPORT_EMAIL || "support@eduai.com",
        };
        // Send reset email
        try {
            yield (0, Sendemail_1.default)({
                email: user.email,
                subject: "Password Reset Request - EduAI",
                template: "password-reset.ejs",
                data: emailData,
            });
        }
        catch (emailError) {
            // Clear token if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            yield user.save();
            console.error("Email sending error:", emailError);
            return next(new AppError_1.AppError("Failed to send password reset email. Please try again later.", 500));
        }
        res.status(200).json({
            success: true,
            message: "If an account exists with this email, a password reset email has been sent.",
        });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        return next(new AppError_1.AppError("An error occurred while processing your request. Please try again.", 500));
    }
}));
exports.resetPassword = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        // Validate input
        if (!token || !newPassword) {
            return next(new AppError_1.AppError("Reset token and new password are required", 400));
        }
        // Validate password
        if (typeof newPassword !== "string") {
            return next(new AppError_1.AppError("Password must be a string", 400));
        }
        if (newPassword.length < 6) {
            return next(new AppError_1.AppError("Password must be at least 6 characters long", 400));
        }
        if (newPassword.length > 128) {
            return next(new AppError_1.AppError("Password must not exceed 128 characters", 400));
        }
        // Optional: Add complexity check to match registration
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(newPassword)) {
            return next(new AppError_1.AppError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character", 400));
        }
        // Hash the provided token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
        // Find user with valid token and non-expired reset period
        const user = yield user_model_1.default.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        }).select("+password");
        if (!user) {
            return next(new AppError_1.AppError("Invalid or expired reset token", 400));
        }
        // Update password and clear reset fields
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        res.status(200).json({
            success: true,
            message: "Password updated successfully. You can now log in.",
        });
    }
    catch (error) {
        console.error("Reset password error:", error);
        return next(new AppError_1.AppError("An error occurred while resetting your password. Please try again.", 500));
    }
}));
// export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token = req.headers.authorization?.split('Bearer ')[1];
//     if (!token) {
//       return res.status(401).json({ success: false, message: 'No token provided' });
//     }
//     // Check if token exists in Redis
//     const session = await client.get(`session:${token}`);
//     if (!session) {
//       return res.status(401).json({ success: false, message: 'Invalid or expired token' });
//     }
//     res.status(200).json({ success: true, message: 'Token is valid' });
//   } catch (error) {
//     next(error);
//   }
// };
