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
// Quiz Question Schema
const quizQuestionSchema = new mongoose_1.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    explanation: { type: String, required: true },
});
// Quiz Schema
const quizSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: [quizQuestionSchema],
    passingScore: { type: Number, default: 70 },
    timeLimit: { type: Number, default: 30 }, // 30 minutes default
});
// Comment Schema
const commentSchema = new mongoose_1.Schema({
    user: { type: Object, required: true },
    question: { type: String, required: true },
    questionReplies: [Object],
    createdAt: { type: Date, default: Date.now },
});
// Review Schema
const reviewSchema = new mongoose_1.Schema({
    user: { type: Object, required: true },
    rating: { type: Number, default: 0 },
    comment: { type: String, required: true },
    CommentReplies: [Object],
    createdAt: { type: Date, default: Date.now },
    helpfulCount: { type: Number, default: 0 },
});
// Link Schema
const linkSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
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
    question: [commentSchema],
    order: { type: Number, required: true }, // To maintain correct lesson order
    isRequired: { type: Boolean, default: true }, // Mark essential lessons
    additionalResources: [linkSchema],
    quizzes: [quizSchema],
});
// Course Schema
const courseSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    estimatedPrice: { type: Number },
    thumbnail: {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
    },
    tags: [{ type: String }],
    level: { type: String, required: true },
    demoUrl: { type: String },
    benefits: [{ title: { type: String, required: true } }],
    prerequisites: [{ title: { type: String, required: true } }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    rating: { type: Number, default: 0 },
    purchased: { type: Number, default: 0 },
    category: { type: String, required: true },
    topics: [{ type: String }],
    instructor: {
        name: { type: String, required: true },
        bio: { type: String },
        avatar: { type: String },
    },
    duration: { type: Number }, // Calculated field
    completionCriteria: {
        requiredLessons: { type: Boolean, default: true },
        requiredQuizzes: { type: Boolean, default: true },
        minimumScore: { type: Number, default: 70 },
    },
    relatedCourses: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Course" }],
    popularity: { type: Number, default: 0 },
    difficultyScore: { type: Number, min: 1, max: 10, default: 5 },
}, { timestamps: true });
// Calculate total duration before saving
courseSchema.pre("save", function (next) {
    if (this.courseData && this.courseData.length > 0) {
        this.duration = this.courseData.reduce((total, data) => total + (data.videoLength || 0), 0);
    }
    next();
});
// Method to update popularity score (could be called periodically)
courseSchema.methods.updatePopularity = function () {
    // Simple popularity algorithm that considers purchases, reviews, and recency
    const reviewWeight = 0.3;
    const purchaseWeight = 0.5;
    const recencyWeight = 0.2;
    const reviewScore = this.reviews.length * (this.rating || 1);
    const purchaseScore = this.purchased || 0;
    // Recency score (higher for newer courses)
    const ageInDays = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(100 - ageInDays, 0);
    this.popularity =
        reviewScore * reviewWeight +
            purchaseScore * purchaseWeight +
            recencyScore * recencyWeight;
    return this.save();
};
const CourseModel = mongoose_1.default.model("Course", courseSchema);
exports.default = CourseModel;
