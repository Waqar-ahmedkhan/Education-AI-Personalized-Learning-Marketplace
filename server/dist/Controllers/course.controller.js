"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPurchasedCourses = exports.generateVideoUrl = exports.downloadCertificatePDF = exports.deleteCourse = exports.getAdminAllCourses = exports.addReplyToReview = exports.addGamificationXP = exports.generateCertificate = exports.trackProgress = exports.addReview = exports.addAnswer = exports.addQuestion = exports.getCoursesbyUser = exports.getallCourses = exports.GetSingleCourse = exports.editCourse = exports.uploadCourse = void 0;
const CatchAsyncError_1 = require("../middlewares/CatchAsyncError");
const AppError_1 = require("../utils/AppError");
const cloudinary_1 = __importDefault(require("cloudinary"));
const course_services_1 = require("../services/course.services");
const Course_model_1 = __importDefault(require("../models/Course.model"));
const RedisConnect_1 = require("../utils/RedisConnect");
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const stream_1 = require("stream");
const mongoose_1 = __importDefault(require("mongoose"));
const Sendemail_1 = __importDefault(require("../utils/Sendemail"));
const axios_1 = __importDefault(require("axios"));
const Notification_model_1 = require("../models/Notification.model");
const user_services_1 = require("../services/user.services");
const user_model_1 = __importDefault(require("../models/user.model"));
exports.uploadCourse = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Received course data:", JSON.stringify(req.body, null, 2));
        const data = req.body;
        // Validate that req.body is not empty
        if (!data || Object.keys(data).length === 0) {
            return next(new AppError_1.AppError("No course data provided in request body", 400));
        }
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            console.log("Uploading thumbnail to Cloudinary...");
            try {
                const myCloud = yield cloudinary_1.default.v2.uploader.upload(thumbnail, {
                    folder: "courses",
                    resource_type: "image",
                });
                console.log("Cloudinary upload successful:", {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                });
                data.thumbnail = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            }
            catch (cloudinaryError) {
                console.error("Cloudinary upload failed:", cloudinaryError.message, cloudinaryError.stack);
                return next(new AppError_1.AppError(`Failed to upload thumbnail: ${cloudinaryError.message}`, 400));
            }
        }
        else {
            console.log("No thumbnail provided, setting to null.");
            data.thumbnail = null;
        }
        console.log("Calling CreateCourse with data:", JSON.stringify(data, null, 2));
        yield (0, course_services_1.CreateCourse)(data, res, next);
    }
    catch (err) {
        console.error("Error in uploadCourse:", err.message, err.stack);
        next(new AppError_1.AppError(`Course upload failed: ${err.message}`, 400));
    }
}));
exports.editCourse = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            yield cloudinary_1.default.v2.uploader.destroy(thumbnail.public_id);
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        const courseId = req.params.id;
        const course = yield Course_model_1.default.findByIdAndUpdate(courseId, {
            $set: data,
        }, { new: true });
        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: course,
        });
    }
    catch (err) {
        console.log(err);
        next(new AppError_1.AppError("Course are not updated thair are some error happening", 400));
    }
}));
exports.GetSingleCourse = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseId = req.params.id;
        if (!courseId)
            return next(new AppError_1.AppError("Missing course ID", 400));
        const isCachedExisted = yield RedisConnect_1.client.get(courseId);
        if (isCachedExisted) {
            const course = JSON.parse(isCachedExisted);
            return res.status(200).json({ success: true, data: course });
        }
        const course = yield Course_model_1.default.findById(courseId).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        if (!course)
            return next(new AppError_1.AppError("Course not found", 404));
        yield RedisConnect_1.client.set(courseId, JSON.stringify(course), { EX: 6048000 });
        res.status(200).json({ success: true, data: course });
    }
    catch (err) {
        console.error("GetSingleCourse error:", err);
        next(new AppError_1.AppError("Failed to fetch course", 500));
    }
}));
// getall courses but without purchaseing
exports.getallCourses = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isCacheExisted = yield RedisConnect_1.client.get("allcoures");
        if (isCacheExisted) {
            const courses = JSON.parse(isCacheExisted);
            console.log("hitting redis");
            return res.status(200).json({
                success: true,
                courses,
            });
        }
        else {
            const courses = yield Course_model_1.default.find({}).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            console.log("mongodb hitting");
            res.status(200).json({
                success: true,
                data: courses,
            });
        }
    }
    catch (err) {
        console.log(err);
        next(new AppError_1.AppError("new error in getallCourses", 400));
    }
}));
exports.getCoursesbyUser = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseId = req.params.id;
        if (!courseId)
            return next(new AppError_1.AppError("Missing course ID", 400));
        const course = yield Course_model_1.default.findById(courseId);
        if (!course)
            return next(new AppError_1.AppError("Course not found", 404));
        res.status(200).json({
            success: true,
            data: {
                courseData: course.courseData || [],
            },
        });
    }
    catch (err) {
        console.error("getCoursesbyUser error:", err);
        next(new AppError_1.AppError("Failed to get course content", 500));
    }
}));
exports.addQuestion = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { question, courseId, contentId } = req.body;
        const course = yield Course_model_1.default.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId)) {
            return next(new AppError_1.AppError("invalid content id ", 400));
        }
        const courseContent = (_a = course === null || course === void 0 ? void 0 : course.courseData) === null || _a === void 0 ? void 0 : _a.find((item) => {
            item._id.equals(contentId);
        });
        if (!courseContent) {
            return next(new AppError_1.AppError("invalid content id", 400));
        }
        const newQuestion = {
            user: req.user,
            question,
            questionReplies: [],
        };
        courseContent.question.push(newQuestion);
        yield Notification_model_1.NotificaModel.create({
            user: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
            title: "new question Recived",
            message: `you have a new question in  ${courseContent.title}`,
        });
        yield (course === null || course === void 0 ? void 0 : course.save());
        res.status(200).json({
            success: true,
            message: "add question successfully",
        });
    }
    catch (err) {
        next(new AppError_1.AppError(" problem in adding question to courses: ", 404));
    }
}));
exports.addAnswer = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { answer, courseId, contentId, questionId } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId)) {
            return next(new AppError_1.AppError("Invalid course ID", 400));
        }
        const course = yield Course_model_1.default.findById(courseId);
        if (!course) {
            return next(new AppError_1.AppError("Course not found", 404));
        }
        const courseContent = course.courseData.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new AppError_1.AppError("Invalid content ID", 400));
        }
        const question = courseContent.question.find((item) => item._id.equals(questionId));
        if (!question) {
            return next(new AppError_1.AppError("Invalid question ID", 400));
        }
        const newAnswer = {
            user: req.user,
            answer,
        };
        question.questionReplies.push(newAnswer);
        yield course.save();
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === question.user._id) {
            // Handle notification for answer on own question
            yield Notification_model_1.NotificaModel.create({
                user: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
                title: "new Question reply recived",
                message: `you have a new question reply in  ${courseContent.title}`,
            });
        }
        else {
            const data = {
                name: (_c = question.user) === null || _c === void 0 ? void 0 : _c.name,
                title: courseContent.title,
            };
            const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/question-reply.ejs"), data);
            try {
                yield (0, Sendemail_1.default)({
                    email: (_d = question.user) === null || _d === void 0 ? void 0 : _d.email,
                    subject: "New Answer on your Question - EduAI",
                    template: "question-reply.ejs",
                    data,
                });
            }
            catch (err) {
                next(new AppError_1.AppError("error in sending mail ", 400));
            }
        }
        res.status(201).json({ message: "Answer added successfully" });
    }
    catch (err) {
        next(new AppError_1.AppError("Error in answering question", 400));
    }
}));
exports.addReview = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userCourseList = (_a = req.user) === null || _a === void 0 ? void 0 : _a.courses;
        const courseId = req.params.id;
        // check if courseId already exists in userCourseList based on _id
        const courseExists = userCourseList === null || userCourseList === void 0 ? void 0 : userCourseList.some((course) => course._id.toString() === courseId.toString());
        if (!courseExists) {
            return next(new AppError_1.AppError("You are not eligible to access this course", 404));
        }
        const course = yield Course_model_1.default.findById(courseId);
        const { review, rating } = req.body;
        const reviewData = {
            user: req.user,
            rating,
            comment: review,
        };
        course === null || course === void 0 ? void 0 : course.reviews.push(reviewData);
        let avg = 0;
        course === null || course === void 0 ? void 0 : course.reviews.forEach((rev) => {
            avg += rev.rating;
        });
        if (course) {
            course.rating = avg / course.reviews.length; // one example we have 2 reviews one is 5 another one is 4 so math working like this = 9 / 2  = 4.5 ratings
        }
        yield (course === null || course === void 0 ? void 0 : course.save());
        yield RedisConnect_1.client.set(courseId, JSON.stringify(course), { EX: 604800 }); // 7days
        // create notification
        yield Notification_model_1.NotificaModel.create({
            user: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
            title: "New Review Received",
            message: `${(_c = req.user) === null || _c === void 0 ? void 0 : _c.name} has given a review in ${course === null || course === void 0 ? void 0 : course.name}`,
        });
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new AppError_1.AppError(error.message, 500));
    }
}));
exports.trackProgress = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { courseId, contentId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const course = yield Course_model_1.default.findById(courseId);
        if (!course)
            return next(new AppError_1.AppError("Course not found", 404));
        let userProgress = course.progress || [];
        const alreadyExists = userProgress.find((item) => item.user.toString() === String(userId) &&
            item.contentId === contentId);
        if (!alreadyExists) {
            userProgress.push({ user: userId, contentId });
            course.progress = userProgress;
            yield course.save();
        }
        res.status(200).json({
            success: true,
            message: "Progress tracked",
        });
    }
    catch (error) {
        return next(new AppError_1.AppError(error.message, 500));
    }
}));
// Generate Certificate if course is completed
exports.generateCertificate = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const courseId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const course = yield Course_model_1.default.findById(courseId);
        if (!course)
            return next(new AppError_1.AppError("Course not found", 404));
        const courseContent = course.courseData;
        const userProgress = course.progress.filter((item) => item.user.toString() === String(userId));
        const completedCount = userProgress.length;
        const totalVideos = courseContent.length;
        if (completedCount !== totalVideos) {
            return next(new AppError_1.AppError("Complete all modules to get certificate", 400));
        }
        const certificateId = new mongoose_1.default.Types.ObjectId();
        course.certificates = [
            ...(course.certificates || []),
            {
                user: userId,
                issuedAt: new Date(),
                certificateId,
            },
        ];
        yield course.save();
        res.status(200).json({
            success: true,
            message: "Certificate generated successfully",
            certificateId,
        });
    }
    catch (error) {
        return next(new AppError_1.AppError(error.message, 500));
    }
}));
// Add XP/Badge to Gamification
exports.addGamificationXP = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { courseId, xp } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const course = yield Course_model_1.default.findById(courseId);
        if (!course)
            return next(new AppError_1.AppError("Course not found", 404));
        let gamification = course.gamification || [];
        if (typeof userId !== "string") {
            return next(new AppError_1.AppError("Invalid user ID", 400));
        }
        let userEntry = gamification.find((g) => g.user.toString() === userId);
        if (!userEntry) {
            userEntry = { user: userId, xp: 0, badges: [] };
            gamification.push(userEntry);
        }
        userEntry.xp += xp;
        if (userEntry.xp >= 100 && !userEntry.badges.includes("Beginner")) {
            userEntry.badges.push("Beginner");
        }
        course.gamification = gamification;
        yield course.save();
        res.status(200).json({
            success: true,
            message: "Gamification XP added",
        });
    }
    catch (error) {
        return next(new AppError_1.AppError(error.message, 500));
    }
}));
exports.addReplyToReview = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { comment, courseId, reviewId } = req.body;
        const course = yield Course_model_1.default.findById(courseId);
        if (!course) {
            return next(new AppError_1.AppError("Course not found", 404));
        }
        const review = (_a = course === null || course === void 0 ? void 0 : course.reviews) === null || _a === void 0 ? void 0 : _a.find((rev) => rev._id.toString() === reviewId);
        if (!review) {
            return next(new AppError_1.AppError("Review not found", 404));
        }
        const replyData = {
            user: req.user,
            comment,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        if (!review.CommentReplies) {
            review.CommentReplies = [];
        }
        (_b = review.CommentReplies) === null || _b === void 0 ? void 0 : _b.push(replyData);
        yield (course === null || course === void 0 ? void 0 : course.save());
        yield RedisConnect_1.client.set(courseId, JSON.stringify(course), { EX: 604800 }); // 7days
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new AppError_1.AppError(error.message, 500));
    }
}));
// get all courses --- only for admin
exports.getAdminAllCourses = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, user_services_1.getalluserServices)(res);
    }
    catch (error) {
        return next(new AppError_1.AppError(error.message, 400));
    }
}));
// Delete Course --- only for admin
exports.deleteCourse = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const course = yield Course_model_1.default.findById(id);
        if (!course) {
            return next(new AppError_1.AppError("course not found", 404));
        }
        yield course.deleteOne({ id });
        yield RedisConnect_1.client.del(id);
        res.status(200).json({
            success: true,
            message: "course deleted successfully",
        });
    }
    catch (error) {
        return next(new AppError_1.AppError(error.message, 400));
    }
}));
//certicficate
exports.downloadCertificatePDF = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const courseId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const userName = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.name) || "Student";
        const course = yield Course_model_1.default.findById(courseId);
        if (!course)
            return next(new AppError_1.AppError("Course not found", 404));
        const hasCertificate = (_c = course.certificates) === null || _c === void 0 ? void 0 : _c.some((cert) => cert.user.toString() === String(userId));
        if (!hasCertificate) {
            return next(new AppError_1.AppError("You must complete the course first!", 400));
        }
        const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/certificate-template.ejs"), {
            userName,
            courseName: course.name,
            date: new Date().toDateString(),
        });
        const doc = new pdfkit_1.default();
        const stream = new stream_1.Readable();
        stream._read = () => { };
        stream.push(html);
        stream.push(null);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=certificate-${course.name}.pdf`);
        doc.text(html);
        doc.pipe(res);
        doc.end();
    }
    catch (error) {
        return next(new AppError_1.AppError(error.message, 500));
    }
}));
// generate video url
exports.generateVideoUrl = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { videoId } = req.body;
        const response = yield axios_1.default.post(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, { ttl: 300 }, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
            },
        });
        res.json(response.data);
    }
    catch (error) {
        return next(new AppError_1.AppError(error.message, 400));
    }
}));
exports.getUserPurchasedCourses = (0, CatchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId)
            return next(new AppError_1.AppError("User not authenticated", 401));
        const cacheKey = `purchased_courses_${userId}`;
        const cachedCourses = yield RedisConnect_1.client.get(cacheKey);
        if (cachedCourses) {
            console.log(`Hitting Redis cache for purchased courses: ${userId}`);
            return res.status(200).json({
                success: true,
                data: JSON.parse(cachedCourses),
            });
        }
        console.log(`Cache miss for purchased courses: ${userId}`);
        const user = yield user_model_1.default.findById(userId).select("courses courseProgress");
        if (!user)
            return next(new AppError_1.AppError("User not found", 404));
        const purchasedCourseIds = user.courses.map((course) => course.courseId);
        if (purchasedCourseIds.length === 0) {
            const emptyResponse = {
                success: true,
                data: [],
                message: "No courses purchased",
            };
            yield RedisConnect_1.client.set(cacheKey, JSON.stringify(emptyResponse.data), { EX: 604800 });
            return res.status(200).json(emptyResponse);
        }
        const courses = yield Course_model_1.default.find({
            _id: { $in: purchasedCourseIds },
        }).select("name description thumbnail category instructor rating purchased duration courseData");
        const coursesWithProgress = courses.map((courseDoc) => {
            const course = courseDoc.toObject();
            const progressData = user.courseProgress.find((p) => String(p.courseId) === String(course._id));
            return Object.assign(Object.assign({}, course), { progress: progressData
                    ? {
                        percentage: progressData.progress,
                        completedLessons: progressData.completedLessons.length,
                        totalLessons: course.courseData.length,
                        lastAccessed: progressData.lastAccessed,
                    }
                    : {
                        percentage: 0,
                        completedLessons: 0,
                        totalLessons: course.courseData.length,
                        lastAccessed: null,
                    } });
        });
        // Cache individual purchase statuses
        for (const course of coursesWithProgress) {
            yield RedisConnect_1.client.set(`purchase:${userId}:${course._id}`, "true", { EX: 604800 });
        }
        yield RedisConnect_1.client.set(cacheKey, JSON.stringify(coursesWithProgress), { EX: 604800 });
        console.log(`Cached purchased courses for user ${userId}`);
        return res.status(200).json({
            success: true,
            data: coursesWithProgress,
        });
    }
    catch (err) {
        console.error("getUserPurchasedCourses error:", err);
        return next(new AppError_1.AppError("Failed to fetch purchased courses", 500));
    }
}));
