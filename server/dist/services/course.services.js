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
const Course_model_1 = __importDefault(require("../models/Course.model"));
exports.CreateCourse = (0, CatchAsyncError_1.CatchAsyncError)((data, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const course = yield Course_model_1.default.create(data);
        res.status(201).json({
            success: true,
            message: "Course created successfully",
            data: course
        });
    }
    catch (err) {
        console.log("error in creating course");
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
