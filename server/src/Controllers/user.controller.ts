import { Request } from "express";
import { CatchAsyncError } from "../middlewares/CatchAsyncError"
import User from "../models/user.model";
import UserModel from "../models/user.model";



interface  IRegistionBody {
  name: string;
  email: string;
  password: string;
  avator?: string;
}





export const RegistrationUser = CatchAsyncError( async (req: Request, res:Response) => {
  try{

    const { name, email , password} = req.body;

   const isEmailExisted  = await UserModel.find(email);
   

  } 
    catch(err){
      console.log(err)
    }


})