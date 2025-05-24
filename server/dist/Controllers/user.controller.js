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
exports.createInitialAdmin = exports.createAdmin = exports.deleteUser = exports.updateUserRoles = exports.getallUsers = exports.UpdateProfilePicture = exports.UpdatePassword = exports.UpdateUserInformation = exports.socialAuth = exports.getUserInformatin = exports.updateAccessToken = exports.UserLogout = exports.UserLogin = exports.activateUser = exports.registerUser = exports.createActivationToken = void 0;
const CatchAsyncError_1 = require("../middlewares/CatchAsyncError");
const user_model_1 = __importDefault(require("../models/user.model"));
const AppError_1 = require("../utils/AppError");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Sendemail_1 = __importDefault(require("../utils/Sendemail"));
const jwt_1 = require("../utils/jwt");
const RedisConnect_1 = require("../utils/RedisConnect");
const user_services_1 = require("../services/user.services");
const cloudinary_1 = __importDefault(require("cloudinary"));
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
        if (!name || typeof name !== 'string') {
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
        if (!email || typeof email !== 'string') {
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
        if (!password || typeof password !== 'string') {
            validationErrors.password = "Password is required";
        }
        else if (password.length < 8) {
            validationErrors.password = "Password must be at least 8 characters long";
        }
        else if (password.length > 128) {
            validationErrors.password = "Password must not exceed 128 characters";
        }
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
            validationErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
        }
        // Return validation errors if any
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        }
        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();
        // Check if user already exists
        let existingUser;
        try {
            existingUser = yield user_model_1.default.findOne({
                email: normalizedEmail
            }).select('email');
        }
        catch (dbError) {
            console.error("Database query error:", dbError);
            return res.status(500).json({
                success: false,
                message: "Database connection error. Please try again later."
            });
        }
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists",
                errors: {
                    email: "This email is already registered. Please use a different email or try logging in."
                }
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
            if (!activationToken || !activationToken.token || !activationToken.activationCode) {
                throw new Error("Invalid token structure generated");
            }
        }
        catch (tokenError) {
            console.error("Token creation error:", tokenError);
            return res.status(500).json({
                success: false,
                message: "Failed to generate activation code. Please try again."
            });
        }
        // Prepare email data with proper structure
        const emailData = {
            user: {
                name: userInput.name,
                email: userInput.email
            },
            activationCode: activationToken.activationCode,
            appName: "EduAI",
            supportEmail: process.env.SUPPORT_EMAIL || "support@eduai.com"
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
            if (emailError.code === 'ENOTFOUND') {
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
                message: `${emailErrorMessage}. Please try again or contact support.`
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
                name: userInput.name
            }
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        // Ensure headers aren't already sent
        if (res.headersSent) {
            return;
        }
        // Handle different types of errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation error occurred",
                errors: error.errors
            });
        }
        if (error.name === 'MongoError' || error.name === 'MongooseError') {
            return res.status(500).json({
                success: false,
                message: "Database error. Please try again later."
            });
        }
        // Generic error response
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred. Please try again later."
        });
    }
}));
// export const registerUser = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { name, email, password } = req.body as IRegistrationBody;
//       // Validate required fields
//       if (!email || !password || !name) {
//         return next(
//           new AppError("Validation failed", 400, {
//             errors: {
//               email: !email ? "Email is required" : undefined,
//               password: !password ? "Password is required" : undefined,
//               name: !name ? "Name is required" : undefined,
//             },
//           })
//         );
//       }
//       // Check email format
//       const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
//       if (!emailRegex.test(email)) {
//         return next(new AppError("Please provide a valid email address", 400));
//       }
//       // Check if email exists
//       const existingUser = await UserModel.findOne({ email });
//       if (existingUser) {
//         res.json({
//           status: "400",
//           message: "Email already exists",
//           path: "email",
//           value: req.body.email,
//         });
//         return next(
//           new AppError("Email already exists", 400, {
//             path: "email",
//             value: req.body.email,
//           })
//         );
//       }
//       // Create user input object
//       const userInput: IRegistrationBody = {
//         name,
//         email,
//         password,
//       };
//       // Generate activation token
//       let activationToken;
//       try {
//         activationToken = createActivationToken(userInput);
//       } catch (tokenError: any) {
//         console.error("Token creation error:", tokenError);
//         return next(
//           new AppError(
//             tokenError.message || "Failed to create activation token",
//             500
//           )
//         );
//       }
//       // Prepare email data
//       const emailData = {
//         user: { name: userInput.name },
//         activationCode: activationToken.activationCode,
//       };
//       try {
//         await sendEmail({
//           email: userInput.email,
//           subject: "Account Activation - EduAI",
//           template: "activation-code.ejs",
//           data: emailData,
//         });
//       } catch (emailError: any) {
//         console.error("Email sending error:", emailError);
//         return next(new AppError("Failed to send activation email", 500));
//       }
//       // Success response
//       return res.status(201).json({
//         success: true,
//         message:
//           "Registration successful! Please check your email for activation code.",
//         activationToken: activationToken.token,
//       });
//     } catch (error: any) {
//       console.error("Registration error:", error);
//       if (!res.headersSent) {
//         return next(new AppError(error.message || "Registration failed", 500));
//       }
//     }
//   }
// );
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
                message: "error in redis",
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
        req.user = user;
        // Set new cookies
        res.cookie("access_token", access_token, jwt_1.accessTokenOptions);
        res.cookie("refresh_token", new_refresh_token, jwt_1.refreshTokenOptions);
        yield RedisConnect_1.client.set(user._id, JSON.stringify(user), { "EX": 6048000 });
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
exports.socialAuth = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, avatar } = req.body;
        if (!email || !name || !avatar) {
            return next(new AppError_1.AppError("Please provide all required fields", 400));
        }
        const user = yield user_model_1.default.create({ email, name, avatar });
        if (!user) {
            const newUser = yield user_model_1.default.create({ email, name, avatar });
            (0, jwt_1.sendToken)(newUser, 200, res);
        }
        else {
            (0, jwt_1.sendToken)(user, 200, res);
        }
    }
    catch (err) {
        console.log("error is not gooded");
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
