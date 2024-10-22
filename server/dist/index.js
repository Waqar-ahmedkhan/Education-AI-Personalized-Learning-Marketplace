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
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middlewares
app.use(express_1.default.json()); // To parse JSON request bodies
app.use(body_parser_1.default.urlencoded({ extended: true })); // To parse URL-encoded request bodies
app.use((0, cors_1.default)()); // To allow cross-origin requests
app.use((0, cookie_parser_1.default)()); // To parse cookies
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong");
    next();
});
// Sample route to test the server
app.get("/", (req, res) => {
    res.send("Server is running!");
});
app.get("*", (req, res) => {
    res.status(404).send("Page not found");
});
// Error handling middleware
// Set up MongoDB connection
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
