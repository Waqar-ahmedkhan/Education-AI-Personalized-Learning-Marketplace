
import express from "express";
import { editCourse, getallCourses, getCoursesbyUser, GetSingleCourse, uploadCourse, addQuestion } from "../Controllers/course.controller";
import { authorizedRoles, isAuthenticated } from "../middlewares/auth";

const  courseRouter = express.Router();



courseRouter.post("/upload-course", isAuthenticated, authorizedRoles("admin"), uploadCourse);
courseRouter.put("/edit-course/:id", isAuthenticated, authorizedRoles("admin"), editCourse);
courseRouter.get("/get-course/:id",  GetSingleCourse);
courseRouter.get("/get-courses", getallCourses);
courseRouter.get("/get-course-content/:id",isAuthenticated, getCoursesbyUser);
courseRouter.put("/add-question", isAuthenticated, addQuestion)


export default courseRouter;



