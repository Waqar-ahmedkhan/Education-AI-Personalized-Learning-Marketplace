import { NextFunction, Request } from "express";
import { CatchAsyncError } from "../middlewares/CatchAsyncError"
import UserModel from "../models/user.model";
import { AppError } from "../utils/AppError";
import { globalErrorHandler } from "../middlewares/GlobalErrorhandler";



interface  IRegistionBody {
  name: string;
  email: string;
  password: string;
  avator?: string;
}





export const RegistrationUser = CatchAsyncError( async (req: Request, res:Response, Next: NextFunction) => {
  try{

    const { name, email , password} = req.body;

   const isEmailExisted  = await UserModel.findOne(email);

   if(isEmailExisted){
    return Next( new AppError("Email is already in use", 400))
   }
   
   const user: IRegistionBody =  {
     name,
     email,
     password,


   }

  } 
    catch(err){
      console.log(err)
    }


})