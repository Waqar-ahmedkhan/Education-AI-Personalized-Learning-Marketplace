import mongoose, { Document, Schema } from "mongoose";

// Define the IComment interface
interface IComment extends Document {
  user: object;
  comment: string;
  CommentReplies: IComment[];
}

// Define the IReview interface
interface IReview extends Document {
  user: object;
  rating: number;
  comment: string;
  CommentReplies: IComment[];
}

// Define the ILink interface
interface ILink extends Document {
  title: string;
  url: string;
}

// Define the ICoursesData interface
interface ICoursesData extends Document {
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
}

// Define the ICourse interface
interface ICourse extends Document {
  name: string;
  description: string;
  price: number;
  estimatedPrice: number;
  thumbnail: string;
  tags: string[];
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: IReview[];
  courseData: ICoursesData[];
  rating?: number;
  purchased?: number;
}

// Comment Schema
const commentSchema = new Schema<IComment>({
  user: { type: Object, required: true },
  comment: { type: String, required: true },
  CommentReplies: [this]
});

// Review Schema
const reviewSchema = new Schema<IReview>({
  user: { type: Object, required: true },
  rating: { type: Number, default: 0 },
  comment: { type: String, required: true },
  CommentReplies: [commentSchema]
});

// Link Schema
const linkSchema = new Schema<ILink>({
  title: { type: String, required: true },
  url: { type: String, required: true }
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
  question: [commentSchema]
});

// Course Schema
const courseSchema = new Schema<ICourse>({
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
});

const CourseModel = mongoose.model<ICourse>("Course", courseSchema);

// const course = await Course.findById(courseId)
//   .populate('courseData.question')
//   .populate('reviews.CommentReplies');


export default CourseModel;
