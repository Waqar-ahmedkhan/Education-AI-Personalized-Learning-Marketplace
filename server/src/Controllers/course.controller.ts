import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/CatchAsyncError";
import { AppError } from "../utils/AppError";
import Cloudinary from "cloudinary";
import {
  CreateCourse,
  getallCoursesServices,
} from "../services/course.services";
import CourseModel, { ICourse } from "../models/Course.model";
import Redis from "ioredis";
import { client } from "../utils/RedisConnect";
import ejs from "ejs";
import path from "path";
import pdf from "pdfkit";
import { Readable } from "stream";
import mongoose from "mongoose";
import sendEmail from "../utils/Sendemail";
import axios from "axios";
import { NotificaModel } from "../models/Notification.model";
import { getalluserServices } from "../services/user.services";
import UserModel from "../models/user.model";
import { Types } from "mongoose";

export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Received course data:", JSON.stringify(req.body, null, 2));
      const data = req.body;

      // Validate that req.body is not empty
      if (!data || Object.keys(data).length === 0) {
        return next(
          new AppError("No course data provided in request body", 400)
        );
      }

      const thumbnail = data.thumbnail;
      if (thumbnail) {
        console.log("Uploading thumbnail to Cloudinary...");
        try {
          const myCloud = await Cloudinary.v2.uploader.upload(thumbnail, {
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
        } catch (cloudinaryError: any) {
          console.error(
            "Cloudinary upload failed:",
            cloudinaryError.message,
            cloudinaryError.stack
          );
          return next(
            new AppError(
              `Failed to upload thumbnail: ${cloudinaryError.message}`,
              400
            )
          );
        }
      } else {
        console.log("No thumbnail provided, setting to null.");
        data.thumbnail = null;
      }

      console.log(
        "Calling CreateCourse with data:",
        JSON.stringify(data, null, 2)
      );
      await CreateCourse(data, res, next);
    } catch (err: any) {
      console.error("Error in uploadCourse:", err.message, err.stack);
      next(new AppError(`Course upload failed: ${err.message}`, 400));
    }
  }
);

export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      const thumbnail = data.thumbnail;

      if (thumbnail) {
        await Cloudinary.v2.uploader.destroy(thumbnail.public_id);

        const myCloud = await Cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const courseId = req.params.id;

      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Course updated successfully",
        data: course,
      });
    } catch (err) {
      console.log(err);
      next(
        new AppError(
          "Course are not updated thair are some error happening",
          400
        )
      );
    }
  }
);

export const GetSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      if (!courseId) return next(new AppError("Missing course ID", 400));

      const isCachedExisted = await client.get(courseId);
      if (isCachedExisted) {
        const course = JSON.parse(isCachedExisted);
        return res.status(200).json({ success: true, data: course });
      }

      const course = await CourseModel.findById(courseId).select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      );

      if (!course) return next(new AppError("Course not found", 404));

      await client.set(courseId, JSON.stringify(course), { EX: 6048000 });

      res.status(200).json({ success: true, data: course });
    } catch (err) {
      console.error("GetSingleCourse error:", err);
      next(new AppError("Failed to fetch course", 500));
    }
  }
);

// getall courses but without purchaseing

export const getallCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCacheExisted = await client.get("allcoures");
      if (isCacheExisted) {
        const courses = JSON.parse(isCacheExisted);
        console.log("hitting redis");

        return res.status(200).json({
          success: true,
          courses,
        });
      } else {
        const courses = await CourseModel.find({}).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        console.log("mongodb hitting");
        res.status(200).json({
          success: true,
          data: courses,
        });
      }
    } catch (err) {
      console.log(err);
      next(new AppError("new error in getallCourses", 400));
    }
  }
);

export const getCoursesbyUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      if (!courseId) return next(new AppError("Missing course ID", 400));

      const course = await CourseModel.findById(courseId);
      if (!course) return next(new AppError("Course not found", 404));

      res.status(200).json({
        success: true,
        data: {
          courseData: course.courseData || [],
        },
      });
    } catch (err) {
      console.error("getCoursesbyUser error:", err);
      next(new AppError("Failed to get course content", 500));
    }
  }
);

// add question to the courses

interface IAddQuestiontoCourse {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId }: IAddQuestiontoCourse = req.body;
      const course = await CourseModel.findById(courseId);
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return next(new AppError("invalid content id ", 400));
      }
      const courseContent = course?.courseData?.find((item: any) => {
        item._id.equals(contentId);
      });
      if (!courseContent) {
        return next(new AppError("invalid content id", 400));
      }

      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };

      courseContent.question.push(newQuestion);

      await NotificaModel.create({
        user: req.user?._id,
        title: "new question Recived",
        message: `you have a new question in  ${courseContent.title}`,
      });

      await course?.save();

      res.status(200).json({
        success: true,
        message: "add question successfully",
      });
    } catch (err: any) {
      next(new AppError(" problem in adding question to courses: ", 404));
    }
  }
);

interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

export const addAnswer = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, courseId, contentId, questionId }: IAddAnswerData =
        req.body;

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return next(new AppError("Invalid course ID", 400));
      }

      const course = await CourseModel.findById(courseId);
      if (!course) {
        return next(new AppError("Course not found", 404));
      }

      const courseContent = course.courseData.find((item: any) =>
        item._id.equals(contentId)
      );
      if (!courseContent) {
        return next(new AppError("Invalid content ID", 400));
      }

      const question = courseContent.question.find((item: any) =>
        item._id.equals(questionId)
      );
      if (!question) {
        return next(new AppError("Invalid question ID", 400));
      }

      const newAnswer: any = {
        user: req.user,
        answer,
      };
      question.questionReplies.push(newAnswer);

      await course.save();

      if (req.user?.id === question.user._id) {
        // Handle notification for answer on own question
        await NotificaModel.create({
          user: req.user?._id,
          title: "new Question reply recived",
          message: `you have a new question reply in  ${courseContent.title}`,
        });
      } else {
        const data = {
          name: question.user?.name,
          title: courseContent.title,
        };

        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/question-reply.ejs"),
          data
        );

        try {
          await sendEmail({
            email: question.user?.email,
            subject: "New Answer on your Question - EduAI",
            template: "question-reply.ejs",
            data,
          });
        } catch (err) {
          next(new AppError("error in sending mail ", 400));
        }
      }

      res.status(201).json({ message: "Answer added successfully" });
    } catch (err) {
      next(new AppError("Error in answering question", 400));
    }
  }
);

// add review in course
interface IAddReviewData {
  review: string;
  rating: number;
  userId: string;
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;

      const courseId = req.params.id;

      // check if courseId already exists in userCourseList based on _id
      const courseExists = userCourseList?.some(
        (course: any) => course._id.toString() === courseId.toString()
      );

      if (!courseExists) {
        return next(
          new AppError("You are not eligible to access this course", 404)
        );
      }

      const course = await CourseModel.findById(courseId);

      const { review, rating } = req.body as IAddReviewData;

      const reviewData: any = {
        user: req.user,
        rating,
        comment: review,
      };

      course?.reviews.push(reviewData);

      let avg = 0;

      course?.reviews.forEach((rev: any) => {
        avg += rev.rating;
      });

      if (course) {
        course.rating = avg / course.reviews.length; // one example we have 2 reviews one is 5 another one is 4 so math working like this = 9 / 2  = 4.5 ratings
      }

      await course?.save();

      await client.set(courseId, JSON.stringify(course), { EX: 604800 }); // 7days

      // create notification
      await NotificaModel.create({
        user: req.user?._id,
        title: "New Review Received",
        message: `${req.user?.name} has given a review in ${course?.name}`,
      });

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new AppError(error.message, 500));
    }
  }
);

// Add this to course.controller.ts
interface ITrackProgress {
  courseId: string;
  contentId: string;
}

export const trackProgress = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, contentId }: ITrackProgress = req.body;
      const userId = req.user?._id;

      const course = await CourseModel.findById(courseId);
      if (!course) return next(new AppError("Course not found", 404));

      let userProgress = (course as any).progress || [];

      const alreadyExists = userProgress.find(
        (item: any) =>
          item.user.toString() === String(userId) &&
          item.contentId === contentId
      );

      if (!alreadyExists) {
        userProgress.push({ user: userId, contentId });
        (course as any).progress = userProgress;
        await course.save();
      }

      res.status(200).json({
        success: true,
        message: "Progress tracked",
      });
    } catch (error: any) {
      return next(new AppError(error.message, 500));
    }
  }
);

// Generate Certificate if course is completed
export const generateCertificate = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const userId = req.user?._id;

      const course = await CourseModel.findById(courseId);
      if (!course) return next(new AppError("Course not found", 404));

      const courseContent = course.courseData;
      const userProgress = (course as any).progress.filter(
        (item: any) => item.user.toString() === String(userId)
      );

      const completedCount = userProgress.length;
      const totalVideos = courseContent.length;

      if (completedCount !== totalVideos) {
        return next(
          new AppError("Complete all modules to get certificate", 400)
        );
      }

      const certificateId = new mongoose.Types.ObjectId();

      (course as any).certificates = [
        ...((course as any).certificates || []),
        {
          user: userId,
          issuedAt: new Date(),
          certificateId,
        },
      ];

      await course.save();

      res.status(200).json({
        success: true,
        message: "Certificate generated successfully",
        certificateId,
      });
    } catch (error: any) {
      return next(new AppError(error.message, 500));
    }
  }
);

// Add XP/Badge to Gamification
export const addGamificationXP = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, xp }: { courseId: string; xp: number } = req.body;
      const userId = req.user?._id;

      const course = await CourseModel.findById(courseId);
      if (!course) return next(new AppError("Course not found", 404));

      let gamification = (course as any).gamification || [];

      if (typeof userId !== "string") {
        return next(new AppError("Invalid user ID", 400));
      }
      let userEntry = gamification.find(
        (g: any) => g.user.toString() === userId
      );

      if (!userEntry) {
        userEntry = { user: userId, xp: 0, badges: [] };
        gamification.push(userEntry);
      }

      userEntry.xp += xp;

      if (userEntry.xp >= 100 && !userEntry.badges.includes("Beginner")) {
        userEntry.badges.push("Beginner");
      }

      (course as any).gamification = gamification;
      await course.save();

      res.status(200).json({
        success: true,
        message: "Gamification XP added",
      });
    } catch (error: any) {
      return next(new AppError(error.message, 500));
    }
  }
);

interface IAddReviewData {
  comment: string;
  courseId: string;
  reviewId: string;
}
export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IAddReviewData;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new AppError("Course not found", 404));
      }

      const review = course?.reviews?.find(
        (rev: any) => rev._id.toString() === reviewId
      );

      if (!review) {
        return next(new AppError("Review not found", 404));
      }

      const replyData: any = {
        user: req.user,
        comment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!review.CommentReplies) {
        review.CommentReplies = [];
      }

      review.CommentReplies?.push(replyData);

      await course?.save();

      await client.set(courseId, JSON.stringify(course), { EX: 604800 }); // 7days

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new AppError(error.message, 500));
    }
  }
);

// get all courses --- only for admin
export const getAdminAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getalluserServices(res);
    } catch (error: any) {
      return next(new AppError(error.message, 400));
    }
  }
);

// Delete Course --- only for admin
export const deleteCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const course = await CourseModel.findById(id);

      if (!course) {
        return next(new AppError("course not found", 404));
      }

      await course.deleteOne({ id });

      await client.del(id);

      res.status(200).json({
        success: true,
        message: "course deleted successfully",
      });
    } catch (error: any) {
      return next(new AppError(error.message, 400));
    }
  }
);

//certicficate

export const downloadCertificatePDF = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const userId = req.user?._id;
      const userName = req.user?.name || "Student";

      const course = await CourseModel.findById(courseId);
      if (!course) return next(new AppError("Course not found", 404));

      const hasCertificate = (course as any).certificates?.some(
        (cert: any) => cert.user.toString() === String(userId)
      );

      if (!hasCertificate) {
        return next(new AppError("You must complete the course first!", 400));
      }

      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/certificate-template.ejs"),
        {
          userName,
          courseName: course.name,
          date: new Date().toDateString(),
        }
      );

      const doc = new pdf();
      const stream = new Readable();
      stream._read = () => {};
      stream.push(html);
      stream.push(null);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=certificate-${course.name}.pdf`
      );

      doc.text(html);
      doc.pipe(res);
      doc.end();
    } catch (error: any) {
      return next(new AppError(error.message, 500));
    }
  }
);

// generate video url
export const generateVideoUrl = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoId } = req.body;
      const response = await axios.post(
        `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
        { ttl: 300 },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
          },
        }
      );
      res.json(response.data);
    } catch (error: any) {
      return next(new AppError(error.message, 400));
    }
  }
);

export const getUserPurchasedCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) return next(new AppError("User not authenticated", 401));

      const cacheKey = `purchased_courses_${userId}`;
      const cachedCourses = await client.get(cacheKey);
      if (cachedCourses) {
        console.log(`Hitting Redis cache for purchased courses: ${userId}`);
        return res.status(200).json({
          success: true,
          data: JSON.parse(cachedCourses),
        });
      }

      console.log(`Cache miss for purchased courses: ${userId}`);
      const user = await UserModel.findById(userId).select(
        "courses courseProgress"
      );
      if (!user) return next(new AppError("User not found", 404));

      const purchasedCourseIds = user.courses.map(
        (course: any) => course.courseId
      );

      if (purchasedCourseIds.length === 0) {
        const emptyResponse = {
          success: true,
          data: [],
          message: "No courses purchased",
        };
        await client.set(cacheKey, JSON.stringify(emptyResponse.data), {
          EX: 604800,
        });
        return res.status(200).json(emptyResponse);
      }

      const courses = await CourseModel.find({
        _id: { $in: purchasedCourseIds },
      }).select(
        "name description thumbnail category instructor rating purchased duration courseData"
      );

      const coursesWithProgress = courses.map((courseDoc) => {
        const course = courseDoc.toObject() as ICourse & {
          _id: Types.ObjectId;
        };
        const progressData = user.courseProgress.find(
          (p: any) => String(p.courseId) === String(course._id)
        );

        return {
          ...course,
          progress: progressData
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
              },
        };
      });

      // Cache individual purchase statuses
      for (const course of coursesWithProgress) {
        await client.set(`purchase:${userId}:${course._id}`, "true", {
          EX: 604800,
        });
      }
      await client.set(cacheKey, JSON.stringify(coursesWithProgress), {
        EX: 604800,
      });
      console.log(`Cached purchased courses for user ${userId}`);

      return res.status(200).json({
        success: true,
        data: coursesWithProgress,
      });
    } catch (err) {
      console.error("getUserPurchasedCourses error:", err);
      return next(new AppError("Failed to fetch purchased courses", 500));
    }
  }
);
