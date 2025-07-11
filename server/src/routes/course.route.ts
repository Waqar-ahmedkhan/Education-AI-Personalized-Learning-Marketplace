
import express from "express";
import { editCourse, getallCourses, getCoursesbyUser, GetSingleCourse, uploadCourse, addQuestion, addAnswer, addReview, addReplyToReview, deleteCourse, trackProgress, generateCertificate, addGamificationXP, downloadCertificatePDF,  } from "../Controllers/course.controller";
import { isAdmin, isAuthenticated } from "../middlewares/auth";

const  courseRouter = express.Router();




courseRouter.get("/get-course/:id",  GetSingleCourse);
courseRouter.get("/get-courses", getallCourses);
courseRouter.get("/get-course-content/:id", getCoursesbyUser);
courseRouter.put("/add-question", isAuthenticated, addQuestion);
courseRouter.put("/add-answer", isAuthenticated, addAnswer);
courseRouter.put("/add-review/:id", isAuthenticated, addReview);


courseRouter.put("/add-reply", isAuthenticated, isAdmin, addReplyToReview);
courseRouter.get("/get-courses", isAuthenticated, isAdmin, getallCourses);
courseRouter.delete("/delete-course/:id", isAuthenticated, isAdmin, deleteCourse);
courseRouter.post("/upload-course", isAuthenticated, isAdmin, uploadCourse);
courseRouter.put("/edit-course/:id", isAuthenticated, isAdmin, editCourse);

// Track video/module progress
courseRouter.post("/track-progress", isAuthenticated, trackProgress);

// Generate certificate (if course completed)
courseRouter.post("/generate-certificate/:id", isAuthenticated, generateCertificate);

// Add XP/badges to user's gamification record
courseRouter.post("/add-xp", isAuthenticated, addGamificationXP);

courseRouter.get("/download-certificate/:id", isAuthenticated, downloadCertificatePDF);



export default courseRouter;



