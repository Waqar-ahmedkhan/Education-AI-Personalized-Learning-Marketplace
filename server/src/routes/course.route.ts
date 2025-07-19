import express from "express";
import {
  editCourse,
  getallCourses,
  getCoursesbyUser,
  GetSingleCourse,
  uploadCourse,
  addQuestion,
  addAnswer,
  addReview,
  addReplyToReview,
  deleteCourse,
  trackProgress,
  generateCertificate,
  addGamificationXP,
  downloadCertificatePDF,
  getUserPurchasedCourses,
} from "../Controllers/course.controller";
import { isAdmin, isAuthenticated, isUser } from "../middlewares/auth";

const courseRouter = express.Router();

courseRouter.get("/get-course/:id", GetSingleCourse);
courseRouter.get("/get-courses", getallCourses);
courseRouter.get("/get-course-content/:id", getCoursesbyUser);
courseRouter.put("/add-question", isAuthenticated, isUser, addQuestion);
courseRouter.put("/add-answer", isAuthenticated, isUser, addAnswer);
courseRouter.put("/add-review/:id", isAuthenticated, isUser, addReview);
courseRouter.put("/add-reply", isAuthenticated, isAdmin, addReplyToReview);
courseRouter.get("/get-courses", isAuthenticated, isAdmin, getallCourses);
courseRouter.delete("/delete-course/:id", isAuthenticated, isAdmin, deleteCourse);
courseRouter.post("/upload-course", isAuthenticated, isAdmin, uploadCourse);
courseRouter.put("/edit-course/:id", isAuthenticated, isAdmin, editCourse);
courseRouter.post("/track-progress", isAuthenticated, isUser, trackProgress);
courseRouter.post("/generate-certificate/:id", isAuthenticated, isUser, generateCertificate);
courseRouter.post("/add-xp", isAuthenticated, isUser, addGamificationXP);
courseRouter.get("/download-certificate/:id", isAuthenticated, isUser, downloadCertificatePDF);
courseRouter.get(
  "/get-purchased-courses",
  isAuthenticated,
  isUser,
  getUserPurchasedCourses
);

export default courseRouter;