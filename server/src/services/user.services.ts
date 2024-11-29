import { json, Response } from "express";
import UserModel from "../models/user.model";
import { client } from "../utils/RedisConnect";

export const getUserbyId = async (id: string, res: Response) => {
  const userJson = await client.get(id);

  if (userJson) {
    const user = JSON.parse(userJson);
    res.status(201).json({
      success: true,
      user,
    });
  }
};

export const getalluserServices = async (res: Response) => {
  const users = await UserModel.find().sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    message: "message in coding",
    users,
  });
};

export const UpdateUserRoleServices = async (
  res: Response,
  id: string,
  role: string
) => {
  const users = await UserModel.findByIdAndUpdate(id, { role }, { new: true });

  res.status(201).json({
    success: true,
    message: "message in coding",
    users,
  });
};
