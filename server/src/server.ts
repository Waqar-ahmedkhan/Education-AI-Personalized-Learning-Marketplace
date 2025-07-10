import { app } from "./index";
import dotenv from "dotenv";
import Cloudinary from "cloudinary";
import connectDB from "./utils/dbConnect";
dotenv.config();


// import { Request, Response } from "express";

// export const testCloudinary = async (req: Request, res: Response) => {
//   try {
//     const result = await Cloudinary.v2.api.test();
//     res.status(200).json({ success: true, message: "Cloudinary connected", result });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

Cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  console.log(`Server is running on port ${process.env.PORT}`);

  console.log("hello world");
  connectDB();
});
