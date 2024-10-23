"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const AppError_1 = require("./utils/AppError");
const GlobalErrorhandler_1 = require("./middlewares/GlobalErrorhandler");
const dbConnect_1 = __importDefault(require("./utils/dbConnect"));
const RedisConnect_1 = require("./utils/RedisConnect");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middlewares
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({ origin: process.env.ORIGIN_URL }));
app.use((0, cookie_parser_1.default)());
//connectDbs
(0, dbConnect_1.default)();
(0, RedisConnect_1.connectRedis)();
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong");
    next();
});
app.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the API!",
        data: {
            name: "API Server",
            version: "1.0.0"
        }
    });
    res.send("Server is running!");
});
app.all("*", (req, res, next) => {
    next(new AppError_1.AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});
app.use(GlobalErrorhandler_1.globalErrorHandler);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
