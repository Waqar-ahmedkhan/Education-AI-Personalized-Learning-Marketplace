import mongoose, { Schema, Document, Model } from "mongoose";

// User Interface (If you have a separate user model, use that instead)
interface IUser {
  id: mongoose.Types.ObjectId;
  name: string;
}

// Comment Interface and Schema
interface IComment extends Document {
  user: IUser;
  comment: string;
}

const CommentSchema = new Schema<IComment>({
  user: {
    type: Object,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
});

// Review Interface and Schema
interface IReview extends Document {
  user: IUser;
  rating: number;
  comment: string;
  CommentReplies: IComment[];
}

const ReviewSchema = new Schema<IReview>({
  user: {
    type: Object,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  CommentReplies: [CommentSchema],
});

// Link Interface and Schema
interface ILink extends Document {
  title: string;
  url: string;
}

const LinkSchema = new Schema<ILink>({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

// CoursesData Interface and Schema
interface ICoursesData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: { public_id: string; url: string };
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  question: IComment[];
}

const CoursesDataSchema = new Schema<ICoursesData>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  videoThumbnail: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },
  videoSection: {
    type: String,
    required: true,
  },
  videoLength: {
    type: Number,
    required: true,
  },
  videoPlayer: {
    type: String,
    required: true,
  },
  links: [LinkSchema],
  suggestion: {
    type: String,
    required: true,
  },
  question: [CommentSchema],
});

// Course Interface and Schema
interface ICourse extends Document {
  name: string;
  description: string;
  price: number;
  estimatedPrice: number;
  thumbnail: string;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: IReview[];
  courseData: ICoursesData[];
  rating?: number;
  purchased?: number;
}

const CourseSchema = new Schema<ICourse>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  estimatedPrice: {
    type: Number,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  tags: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  demoUrl: {
    type: String,
    required: true,
  },
  benefits: [
    {
      title: {
        type: String,
        required: true,
      },
    },
  ],
  prerequisites: [
    {
      title: {
        type: String,
        required: true,
      },
    },
  ],
  reviews: [ReviewSchema],
  courseData: [CoursesDataSchema],
  rating: {
    type: Number,
    default: 0,
  },
  purchased: {
    type: Number,
    default: 0,
  },
});

// Model Creation
const CommentModel: Model<IComment> = mongoose.model("Comment", CommentSchema);
const ReviewModel: Model<IReview> = mongoose.model("Review", ReviewSchema);
const LinkModel: Model<ILink> = mongoose.model("Link", LinkSchema);
const CoursesDataModel: Model<ICoursesData> = mongoose.model("CoursesData", CoursesDataSchema);
const CourseModel: Model<ICourse> = mongoose.model("Course", CourseSchema);

export { CommentModel, ReviewModel, LinkModel, CoursesDataModel, CourseModel };
