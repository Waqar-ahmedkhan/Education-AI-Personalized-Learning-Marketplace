

import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./user.model";

// Define the IComment interface
export interface IComment extends Document {
  user: IUser;
  question: string;
  questionReplies: IComment[];
  createdAt: Date;
}

// Define the IReview interface
export interface IReview extends Document {
  user: object;
  rating: number;
  comment: string;
  CommentReplies?: IComment[];
  createdAt: Date;
  helpfulCount: number;
}

// Define the ILink interface
export interface ILink extends Document {
  title: string;
  url: string;
}

// Define the ICoursesData interface
export interface ICoursesData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  question: IComment[];
  order: number; // To maintain correct lesson order
  isRequired: boolean; // To mark essential lessons
  additionalResources: ILink[];
  quizzes: IQuiz[];
}

// New Quiz interface
export interface IQuiz extends Document {
  title: string;
  description: string;
  questions: IQuizQuestion[];
  passingScore: number;
  timeLimit: number; // in minutes
}

// New Quiz Question interface
export interface IQuizQuestion extends Document {
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation: string;
}

// Define the ICourse interface with enhancements
export interface ICourse extends Document {
  name: string;
  description: string;
  price: number;
  estimatedPrice: number;
  thumbnail: {
    public_id: string;
    url: string;
  };
  tags: string[];
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: IReview[];
  courseData: ICoursesData[];
  rating?: number;
  purchased?: number;
  category: string; // To group courses by category
  topics: string[]; // More specific than tags, for better matching with user interests
  instructor: {
    name: string;
    bio: string;
    avatar: string;
  };
  duration: number; // Total course duration in minutes
  completionCriteria: {
    requiredLessons: boolean; // Must complete all required lessons
    requiredQuizzes: boolean; // Must pass all quizzes
    minimumScore: number; // Minimum average quiz score needed
  };
  relatedCourses: mongoose.Types.ObjectId[]; // References to related courses
  popularity: number; // For recommendation algorithms
  difficultyScore: number; // Numerical score of difficulty (1-10)
}

// Quiz Question Schema
const quizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, required: true },
});

// Quiz Schema
const quizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  questions: [quizQuestionSchema],
  passingScore: { type: Number, default: 70 },
  timeLimit: { type: Number, default: 30 }, // 30 minutes default
});

// Comment Schema
const commentSchema = new Schema<IComment>({
  user: { type: Object, required: true },
  question: { type: String, required: true },
  questionReplies: [Object],
  createdAt: { type: Date, default: Date.now },
});

// Review Schema
const reviewSchema = new Schema<IReview>({
  user: { type: Object, required: true },
  rating: { type: Number, default: 0 },
  comment: { type: String, required: true },
  CommentReplies: [Object],
  createdAt: { type: Date, default: Date.now },
  helpfulCount: { type: Number, default: 0 },
});

// Link Schema
const linkSchema = new Schema<ILink>({
  title: { type: String, required: true },
  url: { type: String, required: true },
});

// CoursesData Schema
const courseDataSchema = new Schema<ICoursesData>({
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
const courseSchema = new Schema<ICourse>(
  {
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
    relatedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    popularity: { type: Number, default: 0 },
    difficultyScore: { type: Number, min: 1, max: 10, default: 5 },
  },
  { timestamps: true }
);

// Calculate total duration before saving
courseSchema.pre<ICourse>("save", function (next) {
  if (this.courseData && this.courseData.length > 0) {
    this.duration = this.courseData.reduce(
      (total, data) => total + (data.videoLength || 0),
      0
    );
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
  const ageInDays =
    (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(100 - ageInDays, 0);

  this.popularity =
    reviewScore * reviewWeight +
    purchaseScore * purchaseWeight +
    recencyScore * recencyWeight;

  return this.save();
};

const CourseModel = mongoose.model<ICourse>("Course", courseSchema);

export default CourseModel;
