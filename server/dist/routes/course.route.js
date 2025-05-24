"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const course_controller_1 = require("../Controllers/course.controller");
const auth_1 = require("../middlewares/auth");
const user_controller_1 = require("../Controllers/user.controller");
const courseRouter = express_1.default.Router();
courseRouter.post("/upload-course", auth_1.isAuthenticated, (0, auth_1.authorizedRoles)("admin"), course_controller_1.uploadCourse);
courseRouter.put("/edit-course/:id", auth_1.isAuthenticated, (0, auth_1.authorizedRoles)("admin"), course_controller_1.editCourse);
courseRouter.get("/get-course/:id", course_controller_1.GetSingleCourse);
courseRouter.get("/get-courses", course_controller_1.getallCourses);
courseRouter.get("/get-course-content/:id", auth_1.isAuthenticated, course_controller_1.getCoursesbyUser);
courseRouter.put("/add-question", auth_1.isAuthenticated, course_controller_1.addQuestion);
courseRouter.put("/add-answer", auth_1.isAuthenticated, course_controller_1.addAnswer);
courseRouter.put("/add-review/:id", auth_1.isAuthenticated, course_controller_1.addReview);
courseRouter.put("/add-reply", auth_1.isAuthenticated, (0, auth_1.authorizedRoles)("admin"), course_controller_1.addReplyToReview);
courseRouter.get("/get-courses", auth_1.isAuthenticated, (0, auth_1.authorizedRoles)("admin"), user_controller_1.getallUsers);
courseRouter.delete("delete-course", auth_1.isAuthenticated, (0, auth_1.authorizedRoles)("admin"), course_controller_1.deleteCourse);
// Track video/module progress
courseRouter.post("/track-progress", auth_1.isAuthenticated, course_controller_1.trackProgress);
// Generate certificate (if course completed)
courseRouter.post("/generate-certificate/:id", auth_1.isAuthenticated, course_controller_1.generateCertificate);
// Add XP/badges to user's gamification record
courseRouter.post("/add-xp", auth_1.isAuthenticated, course_controller_1.addGamificationXP);
courseRouter.get("/download-certificate/:id", auth_1.isAuthenticated, course_controller_1.downloadCertificatePDF);
exports.default = courseRouter;
