import mongoose, {Document, Schema} from "mongoose";

interface IComment extends Document {
  user: object;
  comment: string,

}

interface IReview extends Document {
  user: object,
  rating: number,
  comment: string
  CommentReplies: IComment[];
}

interface ILink extends Document {
  title: string,
  url: string,

}

interface ICoursesData extends Document {
  title: string,
  description: string,
  videoUrl: string,
  videoThumbnail: object
  videoSection: string,
  videoLength: number
  videoPlayert: string
  links: ILink[]
  suggestion: string,
  question: IComment[]

}

interface ICourse extends Document {
  name: string,
  description: string,
  price: number
  estimatedPrice : number
  thumbnial: string
  tags: string
  level: string
  demoUrl: string
  benefits: {title: string}[];
  prerequisities: {title: string}[]
  reviews: IReview[]
  courseData:ICoursesData[];
  rating?: number
  purchased?: number
}


const reviewSchema = new Schema<IReview>({
  user:Object,
  rating:{
    type: Number,
    Deflauts: 0  
  },
  comment: String,

})


