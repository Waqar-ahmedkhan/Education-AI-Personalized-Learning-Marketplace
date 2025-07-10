"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const AppError_1 = require("./utils/AppError");
const GlobalErrorhandler_1 = require("./middlewares/GlobalErrorhandler");
const RedisConnect_1 = require("./utils/RedisConnect");
const user_route_1 = __importDefault(require("./routes/user.route"));
const course_route_1 = __importDefault(require("./routes/course.route"));
const order_route_1 = __importDefault(require("./routes/order.route"));
const notification_route_1 = __importDefault(require("./routes/notification.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const analytics_route_1 = __importDefault(require("./routes/analytics.route"));
dotenv_1.default.config();
exports.app = (0, express_1.default)();
// Middlewares
exports.app.use(express_1.default.json({ limit: '10mb' }));
exports.app.use(body_parser_1.default.urlencoded({ limit: '10mb', extended: true }));
// app.use(cors({ origin: process.env.ORIGIN_URL }));
exports.app.use((0, cors_1.default)({ origin: 'http://localhost:3000', credentials: true }));
exports.app.use((0, cookie_parser_1.default)());
//connectDbs
(0, RedisConnect_1.connectRedis)();
exports.app.use("/api/v1", user_route_1.default);
exports.app.use("/api/v1", admin_route_1.default);
exports.app.use("/api/v1", course_route_1.default);
exports.app.use("/api/v1", order_route_1.default);
exports.app.use("/api/v1", notification_route_1.default);
exports.app.use("/api/v1", analytics_route_1.default);
exports.app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong");
    next();
});
exports.app.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the API!",
        data: {
            name: "API Server",
            version: "1.0.0",
        },
    });
    res.send("Server is running!");
});
exports.app.all("*", (req, res, next) => {
    next(new AppError_1.AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});
exports.app.use(GlobalErrorhandler_1.globalErrorHandler);
