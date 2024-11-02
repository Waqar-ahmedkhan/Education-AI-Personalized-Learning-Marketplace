import { app } from "./index"
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
import connectDB from "./utils/dbConnect";
dotenv.config();

    cloudinary.config({ 
        CLOUD_NAME: process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret:process.env.API_SECRET, 
    });
    
    
    


app.listen(process.env.PORT, ()=> {
  console.log(`Server is running on port ${process.env.PORT}`)
  connectDB();
})