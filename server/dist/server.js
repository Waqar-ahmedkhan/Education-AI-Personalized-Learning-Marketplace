"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
const dbConnect_1 = __importDefault(require("./utils/dbConnect"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    CLOUD_NAME: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});
index_1.app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    (0, dbConnect_1.default)();
});
