import { json, Response } from "express";
import UserModel from "../models/user.model"
import { client } from "../utils/RedisConnect";


export const getUserbyId = async (id: string, res: Response) => {
  const userJson = await client.get(id);

  if(userJson){
    const user = JSON.parse(userJson);
    res.status(201).json({
      success: true,
      user
  })

  }


 
}