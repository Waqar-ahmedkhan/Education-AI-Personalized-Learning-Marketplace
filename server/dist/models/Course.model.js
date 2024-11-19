"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Comment Schema
const commentSchema = new mongoose_1.Schema({
    user: { type: Object, required: true },
    question: { type: String, required: true },
    questionReplies: [Object]
});
// Review Schema
const reviewSchema = new mongoose_1.Schema({
    user: { type: Object, required: true },
    rating: { type: Number, default: 0 },
    comment: { type: String, required: true },
    CommentReplies: [Object]
});
// Link Schema
const linkSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true }
});
// CoursesData Schema
const courseDataSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    videoThumbnail: { type: Object },
    videoSection: { type: String, required: true },
    videoLength: { type: Number, required: true },
    videoPlayer: { type: String, required: true },
    links: [linkSchema],
    suggestion: { type: String },
    question: [commentSchema]
});
// Course Schema
const courseSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    estimatedPrice: { type: Number },
    thumbnail: { type: String },
    tags: [{ type: String }],
    level: { type: String, required: true },
    demoUrl: { type: String },
    benefits: [{ title: { type: String, required: true } }],
    prerequisites: [{ title: { type: String, required: true } }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    rating: { type: Number, default: 0 },
    purchased: { type: Number, default: 0 }
}, { timestamps: true });
const CourseModel = mongoose_1.default.model("Course", courseSchema);
// const course = await Course.findById(courseId)
//   .populate('courseData.question')
//   .populate('reviews.CommentReplies');
exports.default = CourseModel;
