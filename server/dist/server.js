"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const dotenv_1 = __importDefault(require("dotenv"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const dbConnect_1 = __importDefault(require("./utils/dbConnect"));
dotenv_1.default.config();
// import { Request, Response } from "express";
// export const testCloudinary = async (req: Request, res: Response) => {
//   try {
//     const result = await Cloudinary.v2.api.test();
//     res.status(200).json({ success: true, message: "Cloudinary connected", result });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
cloudinary_1.default.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
index_1.app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    console.log(`Server is running on port ${process.env.PORT}`);
    console.log("hello world");
    (0, dbConnect_1.default)();
});
