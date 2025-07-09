export interface AnalyticsData {
  labels: string[];
  data: number[];
}

export interface Course {
  _id: string;
  name: string;
  instructor: { name: string };
  createdAt: string;
}

export interface CourseData {
  title: string;
  description: string;
  videoUrl: string;
  videoLength: number;
}

export interface CourseForm {
  name: string;
  description: string;
  price: number;
  estimatedPrice: number;
  thumbnail: string;
  tags: string;
  level: string;
  demoUrl: string;
  category: string;
  instructor: { name: string };
  courseData: CourseData[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  users?: T;
  courses?: T;
  orders?: T;
  message?: string;
}

export interface AuthContextType {
  token: string | null;
  userRole: string | null;
  userName: string | null;
  isLoading: boolean;
}