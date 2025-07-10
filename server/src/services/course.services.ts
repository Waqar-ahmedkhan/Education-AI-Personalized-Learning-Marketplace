import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/CatchAsyncError";
import { AppError } from "../utils/AppError";
import CourseModel from "../models/Course.model";

export const CreateCourse = CatchAsyncError(async (data: any, res: Response, next: NextFunction) => {
  try {
    // Validate required fields before creating
    const requiredFields = ["name", "description", "price", "level", "category", "instructor"];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      throw new AppError(`Missing required fields: ${missingFields.join(", ")}`, 400);
    }
    if (!data.instructor || !data.instructor.name) {
      throw new AppError("Missing required field: instructor.name", 400);
    }

    console.log("Creating course with data:", JSON.stringify(data, null, 2));
    const course = await CourseModel.create(data);
    console.log("Course created successfully:", course._id);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (err: any) {
    console.error("Error in CreateCourse:", err.message, err.stack);
    next(new AppError(`Failed to create course: ${err.message}`, 400));
  }
});


export const getallCoursesServices = async (res: Response) => {
  const courses = await CourseModel.find().sort({createdAt: -1})

  res.status(201).json({
    success: true,
    message: "message in coding",
    courses
  })
}