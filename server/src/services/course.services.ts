import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/CatchAsyncError";
import { AppError } from "../utils/AppError";
import Course from "../models/Course.model";
import CourseModel from "../models/Course.model";


export const CreateCourse = CatchAsyncError( async ( data:any, res:Response, next: NextFunction)=> {
  try{

    const course = await CourseModel.create(data);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course
    })
   
  } catch(err){
    console.log("error in creating course")
  }

})


export const getallCoursesServices = async (res: Response) => {
  const courses = await CourseModel.find().sort({createdAt: -1})

  res.status(201).json({
    success: true,
    message: "message in coding",
    courses
  })
}