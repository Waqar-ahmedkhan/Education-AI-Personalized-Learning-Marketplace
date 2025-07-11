import { app } from "./index";
import dotenv from "dotenv";
import Cloudinary from "cloudinary";
import connectDB from "./utils/dbConnect";
dotenv.config();



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
