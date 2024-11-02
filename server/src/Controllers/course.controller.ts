import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/CatchAsyncError";
import { AppError } from "../utils/AppError";
import Cloudinary from "cloudinary";
import { CreateCourse } from "../services/course.services";

export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const Thumbnail = data.thumbnail;
      if (Thumbnail) {
        const myCloud = await Cloudinary.v2.uploader.upload(Thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };

      }

      CreateCourse(data, res, next)
    } catch (err) {
      console.log(err);
      next(
        new AppError(
          "course are not uploaded thair are some error happening ",
          400
        )
      );
    }
  }
);
