
import express from "express";
import { editCourse, getallCourses, getCoursesbyUser, GetSingleCourse, uploadCourse, addQuestion, addAnswer, addReview, addReplyToReview, deleteCourse,  } from "../Controllers/course.controller";
import { authorizedRoles, isAuthenticated } from "../middlewares/auth";
import { getallUsers } from "../Controllers/user.controller";

const  courseRouter = express.Router();



courseRouter.post("/upload-course", isAuthenticated, authorizedRoles("admin"), uploadCourse);
courseRouter.put("/edit-course/:id", isAuthenticated, authorizedRoles("admin"), editCourse);
courseRouter.get("/get-course/:id",  GetSingleCourse);
courseRouter.get("/get-courses", getallCourses);
courseRouter.get("/get-course-content/:id",isAuthenticated, getCoursesbyUser);
courseRouter.put("/add-question", isAuthenticated, addQuestion);
courseRouter.put("/add-answer", isAuthenticated, addAnswer);
courseRouter.put("/add-review/:id", isAuthenticated, addReview);
courseRouter.put("/add-reply", isAuthenticated, authorizedRoles("admin"), addReplyToReview);
courseRouter.get("/get-courses", isAuthenticated, authorizedRoles("admin"), getallUsers);
courseRouter.delete("delete-course", isAuthenticated, authorizedRoles("admin"), deleteCourse);




export default courseRouter;



