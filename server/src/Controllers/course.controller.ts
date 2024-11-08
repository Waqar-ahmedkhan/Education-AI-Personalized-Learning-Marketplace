import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/CatchAsyncError";
import { AppError } from "../utils/AppError";
import Cloudinary from "cloudinary";
import { CreateCourse } from "../services/course.services";
import CourseModel from "../models/Course.model";
import Redis from "ioredis";
import { client } from "../utils/RedisConnect";

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
      const isCachedExisted = await client.get(courseId);

      if (isCachedExisted) {
        const course = JSON.parse(isCachedExisted);
        return res.status(200).json({
          success: true,
          course,
        });
      } else {
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
      }
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

// getall courses but without purchaseing

export const getallCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCacheExisted = await client.get("allcoures");
      if (isCacheExisted) {
        const courses = JSON.parse(isCacheExisted);
        console.log("hitting redis");

        return res.status(200).json({
          success: true,
          courses,
        });
      } else {
        const courses = await CourseModel.find({}).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        console.log("mongodb hitting")
        res.status(200).json({
          success: true,
          data: courses,
        });
      }
    } catch (err) {
      console.log(err);
      next(new AppError("new error in getallCourses", 400));
    }
  }
);

export const getCoursesbyUser = CatchAsyncError(async (req: Request, res:Response, next: NextFunction)=> {
  try {
const userCousesList = req.user?.courses
const userId = req.params.user;
const courseExists = userCousesList?.find((course: any)=> {
  course._id.toString()== course._id
})
  } catch{
    next( new AppError("error in courses by users ", 400) );
  }
})


