import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/CatchAsyncError";
import { AppError } from "../utils/AppError";
import Cloudinary from "cloudinary";
import { CreateCourse } from "../services/course.services";
import CourseModel from "../models/Course.model";

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

      CreateCourse(data, res, next);
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

export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      const thumbnail = data.thumbnail;

      if (thumbnail) {
        await Cloudinary.v2.uploader.destroy(thumbnail.public_id);

        const myCloud = await Cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const courseId = req.params.id;

      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Course updated successfully",
        data: course,
      });
    } catch (err) {
      console.log(err);
      next(
        new AppError(
          "Course are not updated thair are some error happening",
          400
        )
      );
    }
  }
);

export const GetSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const course = await CourseModel.findById(courseId).select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      );

      if (!course) {
        return next(new AppError("Course not found", 404));
      }

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (err) {
      console.error(err);
      next(
        new AppError(
          "Courses are not fetched; there was an error processing the request",
          400
        )
      );
    }
  }
);

