
import express from "express";
import { uploadCourse } from "../Controllers/course.controller";
import { authorizedRoles, isAuthenticated } from "../middlewares/auth";

const  courseRouter = express.Router();



courseRouter.post("/upload-course", isAuthenticated, authorizedRoles("admin"), uploadCourse);
courseRouter.put("/edit-course/:id", isAuthenticated, authorizedRoles("admin"), uploadCourse);

export default courseRouter;



