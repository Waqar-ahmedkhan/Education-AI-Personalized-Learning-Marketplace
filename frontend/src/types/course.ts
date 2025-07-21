
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  course?: T;
  message?: string;
}

export interface User {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface CourseThumbnail {
  public_id: string;
  url: string;
}

export interface CourseInstructor {
  name: string;
  bio: string;
  avatar: string;
}

export interface Resource {
  title: string;
  url: string;
  type: 'pdf' | 'link' | 'doc' | 'image' | 'video';
}

export interface Question {
  _id?: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  _id?: string;
  title: string;
  questions: Question[];
  passingScore: number;
  timeLimit?: number;
}

export interface Comment {
  _id?: string;
  user: User;
  question: string;
  questionReplies?: { _id?: string; user: User; answer: string; createdAt: string }[];
  createdAt: string;
  starred?: boolean;
}

interface Lecture {
  _id?: string;
  title: string;
  videoUrl: string;
  isRequired?: boolean;
  order: number;
  videoLength?: number;
  description?: string;
  videoSection?: string;
  videoPlayer?: string;
  question?: Comment[];
  quizzes?: Quiz[];
  additionalResources?: Resource[];
  completed?: boolean;
}

export interface Review {
  _id?: string;
  userId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  CommentReplies?: { _id?: string; user: User; comment: string; createdAt: string }[];
}

export interface CourseData {
  _id?: string;
  title: string;
  videoUrl: string;
  isRequired: boolean;
  order: number;
  description?: string;
  videoSection?: string;
  videoLength?: number;
  videoPlayer?: string;
  question?: Comment[];
  quizzes?: Quiz[];
  additionalResources?: Resource[];
  completed?: boolean;
}

export interface Progress {
  user: string;
  contentId: string;
}

export interface Certificate {
  user: string;
  issuedAt: string;
  certificateId: string;
}

export interface Gamification {
  user: string;
  xp: number;
  badges: string[];
}

export interface Course {
  _id: string;
  name: string;
  description: string;
  price: number;
  thumbnail: CourseThumbnail;
  tags: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor: CourseInstructor;
  duration: number;
  category: string;
  rating: number;
  purchased: number;
  sections?: number;
  lectures?: number;
  courseData?: CourseData[];
  enrolled?: boolean;
  progress?: Progress[];
  certificates?: Certificate[];
  gamification?: Gamification[];
  bio?: string;
  curriculum?: string[];
  createdAt?: string;
  updatedAt?: string;
  completionCriteria?: {
    requiredLessons: boolean;
    requiredQuizzes: boolean;
    minimumScore: number;
  };
  estimatedPrice?: number;
  demoUrl?: string;
  topics?: string[];
  relatedCourses?: string[];
  popularity?: number;
  difficultyScore?: number;
  benefits?: string[];
  prerequisites?: string[];
  reviews?: Review[];
  __v?: number;
}

export type CourseError =
  | 'COURSE_NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'ENROLLMENT_FAILED'
  | 'PAYMENT_FAILED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface CoursePageError {
  type: CourseError;
  message: string;
}

export interface EnrollmentResponse {
  success: boolean;
  sessionId?: string;
  message?: string;
}