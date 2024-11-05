
import express from "express";
import { editCourse, GetSingleCourse, uploadCourse } from "../Controllers/course.controller";
import { authorizedRoles, isAuthenticated } from "../middlewares/auth";

const  courseRouter = express.Router();



courseRouter.post("/upload-course", isAuthenticated, authorizedRoles("admin"), uploadCourse);
courseRouter.put("/edit-course/:id", isAuthenticated, authorizedRoles("admin"), editCourse);
courseRouter.get("/get-course/:id",  GetSingleCourse);


export default courseRouter;



