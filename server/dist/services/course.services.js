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
exports.getallCoursesServices = exports.CreateCourse = void 0;
const CatchAsyncError_1 = require("../middlewares/CatchAsyncError");
const AppError_1 = require("../utils/AppError");
const Course_model_1 = __importDefault(require("../models/Course.model"));
exports.CreateCourse = (0, CatchAsyncError_1.CatchAsyncError)((data, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate required fields before creating
        const requiredFields = ["name", "description", "price", "level", "category", "instructor"];
        const missingFields = requiredFields.filter(field => !data[field]);
        if (missingFields.length > 0) {
            throw new AppError_1.AppError(`Missing required fields: ${missingFields.join(", ")}`, 400);
        }
        if (!data.instructor || !data.instructor.name) {
            throw new AppError_1.AppError("Missing required field: instructor.name", 400);
        }
        console.log("Creating course with data:", JSON.stringify(data, null, 2));
        const course = yield Course_model_1.default.create(data);
        console.log("Course created successfully:", course._id);
        res.status(201).json({
            success: true,
            message: "Course created successfully",
            data: course,
        });
    }
    catch (err) {
        console.error("Error in CreateCourse:", err.message, err.stack);
        next(new AppError_1.AppError(`Failed to create course: ${err.message}`, 400));
    }
}));
const getallCoursesServices = (res) => __awaiter(void 0, void 0, void 0, function* () {
    const courses = yield Course_model_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        message: "message in coding",
        courses
    });
});
exports.getallCoursesServices = getallCoursesServices;
