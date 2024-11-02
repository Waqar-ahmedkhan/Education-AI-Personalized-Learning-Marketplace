
import express from "express";
import { uploadCourse } from "../Controllers/course.controller";

const CourseRoute = express.Router();



CourseRoute.post("/upload-course", uploadCourse);

