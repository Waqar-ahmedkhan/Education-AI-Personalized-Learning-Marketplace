// src/types/course.ts

// ✅ Replaced all `any` with proper, extensible types.
// You can adjust `Question`, `Resource`, `Quiz`, and `Review` types based on your actual data structure.

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  course?: T; // To match API returning { course: {...} }
  message?: string;
}

export interface CourseInstructor {
  name: string;
  bio: string;
  avatar: string;
}

export interface CourseThumbnail {
  public_id: string;
  url: string;
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface Resource {
  title: string;
  url: string;
  type: 'pdf' | 'link' | 'doc' | 'image' | 'video';
}

export interface Quiz {
  title: string;
  questions: Question[];
  passingScore: number;
}

export interface Review {
  userId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
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
  question?: Question[];
  additionalResources?: Resource[];
  quizzes?: Quiz[];
  completed?: boolean;
}

export interface CompletionCriteria {
  requiredLessons: boolean;
  requiredQuizzes: boolean;
  minimumScore: number;
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
  progress?: number;
  bio?: string;
  curriculum?: string[];
  createdAt?: string;
  updatedAt?: string;
  completionCriteria?: CompletionCriteria;
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