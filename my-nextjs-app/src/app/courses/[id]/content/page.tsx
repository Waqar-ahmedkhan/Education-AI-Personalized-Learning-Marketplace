// 'use client';

// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { useTheme } from 'next-themes';
// import { useAuth } from '../../../../lib/auth'; // Import useAuth
// import { 
//   Star, 
//   Heart, 
//   Clock, 
//   Users, 
//   BookOpen, 
//   ArrowLeft, 
//   Share2, 
//   PlayCircle, 
//   Edit, 
//   Trash,
//   Award,
//   Globe,
//   CheckCircle,
//   AlertCircle,
//   Loader2
// } from 'lucide-react';
// import axios from 'axios';
// import { motion, AnimatePresence } from 'framer-motion';
// import { loadStripe} from '@stripe/stripe-js';

// // Enhanced Type Definitions
// interface CourseInstructor {
//   name: string;
//   bio: string;
//   avatar: string;
// }

// interface CourseThumbnail {
//   public_id: string;
//   url: string;
// }

// interface CourseData {
//   title: string;
//   videoUrl: string;
//   isRequired: boolean;
//   order: number;
//   duration?: number;
//   description?: string;
// }

// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   price: number;
//   thumbnail: CourseThumbnail;
//   tags: string[];
//   level: 'Beginner' | 'Intermediate' | 'Advanced';
//   instructor: CourseInstructor;
//   duration: number;
//   category: string;
//   rating: number;
//   purchased: number;
//   courseData?: CourseData[];
//   enrolled?: boolean;
//   progress?: number;
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface ApiResponse<T> {
//   success: boolean;
//   data: T;
//   message?: string;
// }

// interface EnrollmentResponse {
//   success: boolean;
//   sessionId?: string;
//   message?: string;
// }

// // Enhanced Error Types
// type CourseError = 
//   | 'COURSE_NOT_FOUND'
//   | 'UNAUTHORIZED'
//   | 'ENROLLMENT_FAILED'
//   | 'PAYMENT_FAILED'
//   | 'NETWORK_ERROR'
//   | 'UNKNOWN_ERROR';

// interface CoursePageError {
//   type: CourseError;
//   message: string;
// }

// // Animation Variants
// const pageVariants = {
//   initial: { opacity: 0, y: 20 },
//   animate: { opacity: 1, y: 0 },
//   exit: { opacity: 0, y: -20 }
// };

// const staggerChildren = {
//   animate: {
//     transition: {
//       staggerChildren: 0.1
//     }
//   }
// };

// const cardVariants = {
//   initial: { opacity: 0, y: 20 },
//   animate: { opacity: 1, y: 0 },
//   hover: { y: -2, transition: { duration: 0.2 } }
// };

// // Enhanced Skeleton Loader
// const SkeletonCoursePage: React.FC = () => {
//   const { resolvedTheme } = useTheme();
//   const isDark = resolvedTheme === 'dark';
  
//   return (
//     <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4`}>
//       <div className="max-w-7xl mx-auto">
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="animate-pulse space-y-8"
//         >
//           {/* Back button skeleton */}
//           <div className={`h-10 w-32 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
          
//           {/* Hero section skeleton */}
//           <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
//             <div className="flex flex-col md:flex-row gap-6">
//               <div className="md:w-2/3 space-y-4">
//                 <div className="flex gap-2">
//                   <div className={`h-6 w-16 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
//                   <div className={`h-6 w-20 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
//                 </div>
//                 <div className={`h-8 w-3/4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
//                 <div className={`h-4 w-full rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
//                 <div className={`h-4 w-5/6 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
//               </div>
//               <div className="md:w-1/3 space-y-4">
//                 <div className={`h-12 w-full rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
//                 <div className={`h-10 w-full rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
//               </div>
//             </div>
//           </div>
          
//           {/* Content skeleton */}
//           <div className="flex flex-col lg:flex-row gap-8">
//             <div className="lg:w-2/3 space-y-6">
//               <div className={`h-80 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`} />
//               <div className={`h-64 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`} />
//             </div>
//             <div className="lg:w-1/3">
//               <div className={`h-56 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`} />
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// // Enhanced Admin Controls
// interface AdminControlsProps {
//   courseId: string;
//   onEdit: () => void;
//   onDelete: () => void;
//   isDeleting?: boolean;
// }

// const AdminControls: React.FC<AdminControlsProps> = ({ 
//   onEdit, 
//   onDelete, 
//   isDeleting = false 
// }) => {
//   const { resolvedTheme } = useTheme();
//   const isDark = resolvedTheme === 'dark';
  
//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       className="flex gap-3 mt-6"
//     >
//       <motion.button
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//         onClick={onEdit}
//         className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//           isDark 
//             ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg' 
//             : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
//         }`}
//         aria-label="Edit course"
//       >
//         <Edit className="w-4 h-4" />
//         Edit Course
//       </motion.button>
      
//       <motion.button
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//         onClick={onDelete}
//         disabled={isDeleting}
//         className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//           isDark 
//             ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg disabled:opacity-50' 
//             : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg disabled:opacity-50'
//         }`}
//         aria-label="Delete course"
//       >
//         {isDeleting ? (
//           <Loader2 className="w-4 h-4 animate-spin" />
//         ) : (
//           <Trash className="w-4 h-4" />
//         )}
//         {isDeleting ? 'Deleting...' : 'Delete Course'}
//       </motion.button>
//     </motion.div>
//   );
// };

// // Enhanced Error Display
// interface ErrorDisplayProps {
//   error: CoursePageError;
//   onRetry: () => void;
// }

// const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
//   const { resolvedTheme } = useTheme();
//   const isDark = resolvedTheme === 'dark';
  
//   const getErrorIcon = () => {
//     switch (error.type) {
//       case 'COURSE_NOT_FOUND':
//         return <AlertCircle className="w-16 h-16 text-yellow-500" />;
//       case 'UNAUTHORIZED':
//         return <AlertCircle className="w-16 h-16 text-red-500" />;
//       default:
//         return <AlertCircle className="w-16 h-16 text-gray-500" />;
//     }
//   };
  
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center p-6`}
//     >
//       <div className="text-center max-w-md">
//         <div className="mb-6 flex justify-center">
//           {getErrorIcon()}
//         </div>
//         <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
//           {error.message}
//         </h2>
//         <div className="space-y-3">
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={onRetry}
//             className={`w-full px-6 py-3 rounded-lg text-sm font-medium transition-all ${
//               isDark 
//                 ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg' 
//                 : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
//             }`}
//           >
//             Try Again
//           </motion.button>
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => window.history.back()}
//             className={`w-full px-6 py-3 rounded-lg text-sm font-medium transition-all ${
//               isDark 
//                 ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg' 
//                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-lg'
//             }`}
//           >
//             Go Back
//           </motion.button>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// // Main Component
// export default function GetSingleCoursePage(): JSX.Element {
//   const { token, user } = useAuth();
//   const { resolvedTheme } = useTheme();
//   const params = useParams();
//   const router = useRouter();
  
//   // State management
//   const [course, setCourse] = useState<Course | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<CoursePageError | null>(null);
//   const [isFavorite, setIsFavorite] = useState<boolean>(false);
//   const [activeVideo, setActiveVideo] = useState<string | null>(null);
//   const [expandedSection, setExpandedSection] = useState<string | null>(null);
//   const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
//   const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
//   const isDark = resolvedTheme === 'dark';
//   const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  
//   // Memoized values
//   const courseId = useMemo(() => {
//     if (typeof params.id === 'string') return params.id;
//     if (Array.isArray(params.id)) return params.id[0];
//     return null;
//   }, [params.id]);
  
//   const isAdmin = useMemo(() => user?.role === 'admin', [user?.role]);
  
//   // Error handling utility
//   const handleError = useCallback((error: unknown): CoursePageError => {
//     if (axios.isAxiosError(error)) {
//       const axiosError = error as AxiosError;
//       switch (axiosError.response?.status) {
//         case 401:
//           return { type: 'UNAUTHORIZED', message: 'Please log in to access this course' };
//         case 404:
//           return { type: 'COURSE_NOT_FOUND', message: 'Course not found' };
//         case 403:
//           return { type: 'UNAUTHORIZED', message: 'You are not authorized to access this course' };
//         default:
//           return { type: 'NETWORK_ERROR', message: 'Network error occurred' };
//       }
//     }
//     return { type: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' };
//   }, []);
  
//   // Fetch course data
//   const fetchCourse = useCallback(async () => {
//     if (!courseId) return;
    
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       const response = await axios.get<ApiResponse<Course>>(`${baseUrl}/api/v1/get-course/${courseId}`);
      
//       if (!response.data.success) {
//         throw new Error(response.data.message || 'Failed to fetch course');
//       }
      
//       const courseData = response.data.data;
//       setCourse(courseData);
      
//       // Handle favorites
//       const savedFavorites = localStorage.getItem('courseFavorites');
//       if (savedFavorites) {
//         try {
//           const favorites = new Set<string>(JSON.parse(savedFavorites));
//           setIsFavorite(favorites.has(courseData._id));
//         } catch (e) {
//           console.warn('Failed to parse favorites from localStorage');
//         }
//       }
      
//       // Fetch user-specific data if authenticated
//       if (token) {
//         try {
//           const contentResponse = await axios.get<ApiResponse<{ courseData: CourseData[] }>>(
//             `${baseUrl}/api/v1/get-course-content/${courseId}`,
//             { headers: { Authorization: `Bearer ${token}` } }
//           );
          
//           if (contentResponse.data.success) {
//             const enrolledCourseData = {
//               ...courseData,
//               courseData: contentResponse.data.data.courseData,
//               enrolled: true
//             };
//             setCourse(enrolledCourseData);
            
//             // Set first video as active
//             if (contentResponse.data.data.courseData?.[0]?.videoUrl) {
//               setActiveVideo(contentResponse.data.data.courseData[0].videoUrl);
//             }
//           }
//         } catch (contentError) {
//           if (axios.isAxiosError(contentError) && contentError.response?.status === 404) {
//             setCourse({ ...courseData, enrolled: false });
//           }
//         }
//       }
//     } catch (error) {
//       setError(handleError(error));
//     } finally {
//       setIsLoading(false);
//     }
//   }, [courseId, token, baseUrl, handleError]);
  
//   useEffect(() => {
//     fetchCourse();
//   }, [fetchCourse]);
  
//   // Toggle favorite
//   const toggleFavorite = useCallback(() => {
//     if (!course) return;
    
//     setIsFavorite(prev => !prev);
    
//     try {
//       const savedFavorites = localStorage.getItem('courseFavorites');
//       const favorites = savedFavorites ? new Set<string>(JSON.parse(savedFavorites)) : new Set<string>();
      
//       if (favorites.has(course._id)) {
//         favorites.delete(course._id);
//       } else {
//         favorites.add(course._id);
//       }
      
//       localStorage.setItem('courseFavorites', JSON.stringify(Array.from(favorites)));
//     } catch (error) {
//       console.warn('Failed to update favorites in localStorage');
//     }
//   }, [course]);
  
//   // Toggle section expansion
//   const toggleSection = useCallback((sectionId: string) => {
//     setExpandedSection(prev => prev === sectionId ? null : sectionId);
//   }, []);
  
//   // Handle enrollment/payment
//   const handleEnroll = useCallback(async () => {
//     if (!course || !token) {
//       router.push('/login');
//       return;
//     }
    
//     setIsEnrolling(true);
    
//     try {
//       if (course.price === 0) {
//         // Free course enrollment
//         await axios.post(
//           `${baseUrl}/api/v1/enroll-course/${course._id}`,
//           {},
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setCourse(prev => prev ? { ...prev, enrolled: true } : null);
//       } else {
//         // Paid course via Stripe
//         const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
//         if (!stripe) {
//           throw new Error('Stripe failed to load');
//         }
        
//         const response = await axios.post<EnrollmentResponse>(
//           `${baseUrl}/api/v1/create-checkout-session`,
//           {
//             courseId: course._id,
//             price: course.price,
//           },
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
        
//         if (response.data.sessionId) {
//           await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
//         } else {
//           throw new Error('Failed to create checkout session');
//         }
//       }
//     } catch (error) {
//       setError({ type: 'ENROLLMENT_FAILED', message: 'Enrollment failed. Please try again.' });
//     } finally {
//       setIsEnrolling(false);
//     }
//   }, [course, token, router, baseUrl]);
  
//   // Handle edit course
//   const handleEdit = useCallback(() => {
//     if (course) {
//       router.push(`/courses/edit/${course._id}`);
//     }
//   }, [course, router]);
  
//   // Handle delete course
//   const handleDelete = useCallback(async () => {
//     if (!course || !token) return;
    
//     if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
//       return;
//     }
    
//     setIsDeleting(true);
    
//     try {
//       await axios.delete(`${baseUrl}/api/v1/delete-course`, {
//         headers: { Authorization: `Bearer ${token}` },
//         data: { courseId: course._id },
//       });
      
//       router.push('/courses');
//     } catch (error) {
//       setError({ type: 'UNKNOWN_ERROR', message: 'Failed to delete course' });
//     } finally {
//       setIsDeleting(false);
//     }
//   }, [course, token, router, baseUrl]);
  
//   // Render stars
//   const renderStars = useCallback((rating: number) => {
//     return Array.from({ length: 5 }, (_, i) => (
//       <Star
//         key={i}
//         className={`w-5 h-5 ${
//           i < Math.floor(rating) 
//             ? 'text-yellow-400 fill-current' 
//             : isDark 
//               ? 'text-gray-600' 
//               : 'text-gray-300'
//         }`}
//       />
//     ));
//   }, [isDark]);
  
//   // Format duration
//   const formatDuration = useCallback((duration: number): string => {
//     const hours = Math.floor(duration / 60);
//     const minutes = duration % 60;
//     return `${hours}h ${minutes}m`;
//   }, []);
  
//   // Get level color
//   const getLevelColor = useCallback((level: string) => {
//     switch (level) {
//       case 'Beginner':
//         return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
//       case 'Intermediate':
//         return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
//       case 'Advanced':
//         return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
//       default:
//         return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
//     }
//   }, []);
  
//   // Loading state
//   if (isLoading) {
//     return <SkeletonCoursePage />;
//   }
  
//   // Error state
//   if (error) {
//     return <ErrorDisplay error={error} onRetry={fetchCourse} />;
//   }
  
//   // Course not found
//   if (!course) {
//     return (
//       <ErrorDisplay 
//         error={{ type: 'COURSE_NOT_FOUND', message: 'Course not found' }} 
//         onRetry={fetchCourse} 
//       />
//     );
//   }
  
//   return (
//     <motion.section
//       variants={pageVariants}
//       initial="initial"
//       animate="animate"
//       exit="exit"
//       className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4 sm:px-6`}
//       aria-labelledby="course-title"
//     >
//       <div className="max-w-7xl mx-auto">
//         <motion.div
//           variants={staggerChildren}
//           initial="initial"
//           animate="animate"
//           className="space-y-8"
//         >
//           {/* Enhanced Back Button */}
//           <motion.div variants={cardVariants}>
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={() => router.push('/courses')}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//                 isDark 
//                   ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 hover:shadow-lg' 
//                   : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg'
//               } shadow-sm`}
//               aria-label="Back to courses"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Back to Courses
//             </motion.button>
//           </motion.div>
          
//           {/* Enhanced Hero Section */}
//           <motion.div
//             variants={cardVariants}
//             whileHover="hover"
//             className={`relative rounded-2xl p-8 shadow-xl transition-all ${
//               isDark 
//                 ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
//                 : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
//             }`}
//           >
//             <div className="flex flex-col md:flex-row gap-8">
//               {/* Course Info */}
//               <div className="md:w-2/3">
//                 <div className="flex items-center gap-3 mb-4">
//                   {course.tags.map((tag, index) => (
//                     <motion.span
//                       key={tag}
//                       initial={{ opacity: 0, scale: 0.8 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ delay: index * 0.1 }}
//                       className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         isDark 
//                           ? 'bg-blue-600 text-blue-100' 
//                           : 'bg-blue-500 text-white'
//                       }`}
//                     >
//                       {tag}
//                     </motion.span>
//                   ))}
//                   <motion.span
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ delay: course.tags.length * 0.1 }}
//                     className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}
//                   >
//                     {course.level}
//                   </motion.span>
//                 </div>
                
//                 <motion.h1
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.2 }}
//                   id="course-title"
//                   className={`text-4xl md:text-5xl font-bold mb-4 ${
//                     isDark ? 'text-white' : 'text-gray-900'
//                   }`}
//                 >
//                   {course.name}
//                 </motion.h1>
                
//                 <motion.p
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.3 }}
//                   className={`text-lg leading-relaxed mb-6 ${
//                     isDark ? 'text-gray-300' : 'text-gray-600'
//                   }`}
//                 >
//                   {course.description}
//                 </motion.p>
                
//                 {/* Enhanced Stats */}
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.4 }}
//                   className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
//                 >
//                   <div className={`flex items-center gap-3 p-3 rounded-lg ${
//                     isDark ? 'bg-gray-800/50' : 'bg-white/50'
//                   }`}>
//                     <div className="flex items-center gap-1">
//                       <span className="text-xl font-bold text-yellow-500">{course.rating}</span>
//                       <div className="flex gap-1">{renderStars(course.rating)}</div>
//                     </div>
//                     <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
//                       ({course.purchased.toLocaleString()} reviews)
//                     </span>
//                   </div>
                  
//                   <div className={`flex items-center gap-3 p-3 rounded-lg ${
//                     isDark ? 'bg-gray-800/50' : 'bg-white/50'
//                   }`}>
//                     <Users className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
//                     <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                       {course.purchased.toLocaleString()} enrolled
//                     </span>
//                   </div>
                  
//                   <div className={`flex items-center gap-3 p-3 rounded-lg ${
//                     isDark ? 'bg-gray-800/50' : 'bg-white/50'
//                   }`}>
//                     <Clock className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
//                     <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                       {formatDuration(course.duration)}
//                     </span>
//                   </div>
//                 </motion.div>
                
//                 {/* Enrollment Status */}
//                 {course.enrolled && (
//                   <motion.div
//                     initial={{ opacity: 0, scale: 0.95 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ delay: 0.5 }}
//                     className={`flex items-center gap-3 p-4 rounded-lg ${
//                       isDark 
//                         ? 'bg-green-900/20 border border-green-800' 
//                         : 'bg-green-50 border border-green-200'
//                     }`}
//                   >
//                     <CheckCircle className="w-5 h-5 text-green-500" />
//                     <div>
//                       <p className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
//                         Enrolled Successfully!
//                       </p>
//                       <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-500'}`}>
//                         Progress: {course.progress || 0}% complete
//                       </p>
//                     </div>
//                   </motion.div>
//                 )}
//               </div>
              
//               {/* Course Action Panel */}
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.3 }}
//                 className="md:w-1/3"
//               >
//                 <div className={`p-6 rounded-2xl ${
//                   isDark 
//                     ? 'bg-gray-800 border border-gray-700' 
//                     : 'bg-white border border-gray-200'
//                 } shadow-lg`}>
//                   {/* Action Buttons */}
//                   <div className="flex items-center justify-between mb-6">
//                     <div className="flex items-center gap-3">
//                       <motion.button
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                         onClick={toggleFavorite}
//                         className={`p-3 rounded-full transition-all ${
//                           isFavorite 
//                             ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
//                             : isDark 
//                               ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
//                               : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                         } shadow-sm`}
//                         aria-label={isFavorite ? `Remove ${course.name} from favorites` : `Add ${course.name} to favorites`}
//                       >
//                         <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
//                       </motion.button>
                      
//                       <motion.button
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                         className={`p-3 rounded-full transition-all ${
//                           isDark 
//                             ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
//                             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                         } shadow-sm`}
//                         aria-label="Share this course"
//                       >
//                         <Share2 className="w-5 h-5" />
//                       </motion.button>
//                     </div>
//                   </div>
                  
//                   {/* Price Display */}
//                   <div className="text-center mb-6">
//                     <motion.span
//                       initial={{ opacity: 0, scale: 0.8 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ delay: 0.4 }}
//                       className={`text-4xl font-bold ${
//                         course.price === 0 
//                           ? 'text-green-600' 
//                           : isDark 
//                             ? 'text-blue-400' 
//                             : 'text-blue-600'
//                       }`}
//                     >
//                       {course.price === 0 ? 'Free' : `${course.price}`}
//                     </motion.span>
//                     {course.price > 0 && (
//                       <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
//                         One-time payment
//                       </p>
//                     )}
//                   </div>
                  
//                   {/* Enroll Button */}
//                   <motion.button
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     onClick={handleEnroll}
//                     disabled={course.enrolled || isEnrolling}
//                     className={`w-full py-4 px-6 rounded-xl text-lg font-semibold transition-all ${
//                       course.enrolled
//                         ? isDark
//                           ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
//                           : 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                         : isDark
//                         ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
//                         : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
//                     }`}
//                     aria-label={
//                       course.enrolled 
//                         ? 'Already enrolled' 
//                         : course.price === 0 
//                           ? `Start ${course.name}` 
//                           : `Enroll in ${course.name}`
//                     }
//                   >
//                     {isEnrolling ? (
//                       <div className="flex items-center justify-center gap-2">
//                         <Loader2 className="w-5 h-5 animate-spin" />
//                         Processing...
//                       </div>
//                     ) : course.enrolled ? (
//                       <div className="flex items-center justify-center gap-2">
//                         <CheckCircle className="w-5 h-5" />
//                         Enrolled
//                       </div>
//                     ) : (
//                       <div className="flex items-center justify-center gap-2">
//                         {course.price === 0 ? (
//                           <>
//                             <PlayCircle className="w-5 h-5" />
//                             Start Learning
//                           </>
//                         ) : (
//                           <>
//                             <Award className="w-5 h-5" />
//                             Enroll Now
//                           </>
//                         )}
//                       </div>
//                     )}
//                   </motion.button>
                  
//                   {/* Admin Controls */}
//                   {isAdmin && (
//                     <AdminControls
//                       courseId={course._id}
//                       onEdit={handleEdit}
//                       onDelete={handleDelete}
//                       isDeleting={isDeleting}
//                     />
//                   )}
                  
//                   {/* Course Features */}
//                   <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
//                     <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                       This course includes:
//                     </h3>
//                     <div className="space-y-2">
//                       <div className="flex items-center gap-2">
//                         <PlayCircle className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
//                         <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                           {course.courseData?.length || 0} video lessons
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Clock className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
//                         <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                           {formatDuration(course.duration)} total content
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Globe className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
//                         <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                           Lifetime access
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Award className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
//                         <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                           Certificate of completion
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//           </motion.div>
          
//           {/* Main Content Area */}
//           <div className="flex flex-col lg:flex-row gap-8">
//             {/* Left Column - Video & Content */}
//             <div className="lg:w-2/3 space-y-8">
//               {/* Video Player */}
//               {course.enrolled && course.courseData && (
//                 <motion.div
//                   variants={cardVariants}
//                   initial="initial"
//                   animate="animate"
//                   className={`rounded-2xl overflow-hidden shadow-xl ${
//                     isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
//                   }`}
//                 >
//                   <div className="relative">
//                     <div className="aspect-video bg-black rounded-t-2xl overflow-hidden">
//                       {activeVideo ? (
//                         <iframe
//                           src={activeVideo}
//                           className="w-full h-full"
//                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                           allowFullScreen
//                           title="Course video"
//                         />
//                       ) : (
//                         <div className="flex flex-col items-center justify-center w-full h-full">
//                           <PlayCircle className="w-16 h-16 text-gray-400 mb-4" />
//                           <p className="text-lg text-gray-400">Select a lecture to start</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="p-6">
//                     <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                       Course Content
//                     </h2>
//                     <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                       {course.description}
//                     </p>
//                   </div>
//                 </motion.div>
//               )}
              
//               {/* Course Curriculum */}
//               {course.enrolled && course.courseData && (
//                 <motion.div
//                   variants={cardVariants}
//                   initial="initial"
//                   animate="animate"
//                   className={`rounded-2xl overflow-hidden shadow-xl ${
//                     isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
//                   }`}
//                 >
//                   <div className="p-6">
//                     <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                       Course Curriculum
//                     </h2>
                    
//                     <div className="space-y-4">
//                       <div className={`border rounded-xl overflow-hidden ${
//                         isDark ? 'border-gray-700' : 'border-gray-200'
//                       }`}>
//                         <motion.button
//                           whileHover={{ backgroundColor: isDark ? '#374151' : '#f9fafb' }}
//                           onClick={() => toggleSection('main')}
//                           className={`w-full flex justify-between items-center p-6 text-left transition-all ${
//                             isDark ? 'bg-gray-700/50 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
//                           }`}
//                         >
//                           <div className="flex items-center gap-4">
//                             <div className={`p-2 rounded-lg ${
//                               isDark ? 'bg-blue-600' : 'bg-blue-500'
//                             }`}>
//                               <BookOpen className="w-5 h-5 text-white" />
//                             </div>
//                             <div>
//                               <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                                 Course Lessons
//                               </h3>
//                               <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
//                                 {course.courseData.length} lectures • {formatDuration(course.duration)}
//                               </p>
//                             </div>
//                           </div>
//                           <motion.div
//                             animate={{ rotate: expandedSection === 'main' ? 180 : 0 }}
//                             transition={{ duration: 0.2 }}
//                           >
//                             <svg
//                               className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                             </svg>
//                           </motion.div>
//                         </motion.button>
                        
//                         <AnimatePresence>
//                           {expandedSection === 'main' && (
//                             <motion.div
//                               initial={{ opacity: 0, height: 0 }}
//                               animate={{ opacity: 1, height: 'auto' }}
//                               exit={{ opacity: 0, height: 0 }}
//                               transition={{ duration: 0.3 }}
//                               className={`${isDark ? 'bg-gray-800' : 'bg-white'}`}
//                             >
//                               <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
//                                 {course.courseData.map((lecture, index) => (
//                                   <motion.div
//                                     key={lecture.order}
//                                     initial={{ opacity: 0, x: -20 }}
//                                     animate={{ opacity: 1, x: 0 }}
//                                     transition={{ delay: index * 0.05 }}
//                                     className="p-4"
//                                   >
//                                     <motion.button
//                                       whileHover={{ scale: 1.01 }}
//                                       whileTap={{ scale: 0.99 }}
//                                       onClick={() => setActiveVideo(lecture.videoUrl)}
//                                       className={`w-full flex items-center gap-4 text-left p-3 rounded-lg transition-all ${
//                                         activeVideo === lecture.videoUrl
//                                           ? isDark
//                                             ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
//                                             : 'bg-blue-50 text-blue-600 border border-blue-200'
//                                           : isDark
//                                           ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
//                                           : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                                       }`}
//                                     >
//                                       <div className={`p-2 rounded-full ${
//                                         activeVideo === lecture.videoUrl
//                                           ? isDark
//                                             ? 'bg-blue-600'
//                                             : 'bg-blue-500'
//                                           : isDark
//                                           ? 'bg-gray-700'
//                                           : 'bg-gray-100'
//                                       }`}>
//                                         <PlayCircle className={`w-4 h-4 ${
//                                           activeVideo === lecture.videoUrl
//                                             ? 'text-white'
//                                             : isDark
//                                             ? 'text-gray-400'
//                                             : 'text-gray-500'
//                                         }`} />
//                                       </div>
//                                       <div className="flex-1 min-w-0">
//                                         <h4 className="font-medium truncate">{lecture.title}</h4>
//                                         <p className={`text-sm ${
//                                           activeVideo === lecture.videoUrl
//                                             ? 'text-blue-500'
//                                             : isDark
//                                             ? 'text-gray-400'
//                                             : 'text-gray-500'
//                                         }`}>
//                                           Lesson {lecture.order}
//                                           {lecture.duration && ` • ${Math.floor(lecture.duration / 60)}:${String(lecture.duration % 60).padStart(2, '0')}`}
//                                         </p>
//                                       </div>
//                                       <div className="flex items-center gap-2">
//                                         {lecture.isRequired && (
//                                           <span className={`text-xs px-2 py-1 rounded-full ${
//                                             isDark
//                                               ? 'bg-red-900/30 text-red-400 border border-red-800'
//                                               : 'bg-red-100 text-red-600 border border-red-200'
//                                           }`}>
//                                             Required
//                                           </span>
//                                         )}
//                                         {activeVideo === lecture.videoUrl && (
//                                           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//                                         )}
//                                       </div>
//                                     </motion.button>
//                                   </motion.div>
//                                 ))}
//                               </div>
//                             </motion.div>
//                           )}
//                         </AnimatePresence>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
              
//               {/* Course Description for Non-Enrolled Users */}
//               {!course.enrolled && (
//                 <motion.div
//                   variants={cardVariants}
//                   initial="initial"
//                   animate="animate"
//                   className={`rounded-2xl p-8 shadow-xl ${
//                     isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
//                   }`}
//                 >
//                   <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                     About This Course
//                   </h2>
//                   <div className={`prose ${isDark ? 'prose-invert' : 'prose-gray'} max-w-none`}>
//                     <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                       {course.description}
//                     </p>
//                   </div>
                  
//                   <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
//                     <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                       🎯 What You'll Learn
//                     </h3>
//                     <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                       Enroll now to access the complete course curriculum and start your learning journey!
//                     </p>
//                   </div>
//                 </motion.div>
//               )}
//             </div>
            
//             {/* Right Column - Course Details */}
//             <div className="lg:w-1/3 space-y-6">
//               {/* Instructor Info */}
//               <motion.div
//                 variants={cardVariants}
//                 initial="initial"
//                 animate="animate"
//                 className={`rounded-2xl p-6 shadow-xl ${
//                   isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
//                 }`}
//               >
//                 <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                   Instructor
//                 </h2>
//                 <div className="flex items-center gap-4 mb-4">
//                   <div className={`w-12 h-12 rounded-full ${
//                     isDark ? 'bg-gray-700' : 'bg-gray-200'
//                   } flex items-center justify-center`}>
//                     <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                       {course.instructor.name.charAt(0)}
//                     </span>
//                   </div>
//                   <div>
//                     <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                       {course.instructor.name}
//                     </h3>
//                     <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
//                       Course Instructor
//                     </p>
//                   </div>
//                 </div>
//                 <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                   {course.instructor.bio}
//                 </p>
//               </motion.div>
              
//               {/* Course Stats */}
//               <motion.div
//                 variants={cardVariants}
//                 initial="initial"
//                 animate="animate"
//                 className={`rounded-2xl p-6 shadow-xl ${
//                   isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
//                 }`}
//               >
//                 <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                   Course Statistics
//                 </h2>
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}>
//                         <Clock className="w-5 h-5 text-white" />
//                       </div>
//                       <div>
//                         <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                           Duration
//                         </p>
//                         <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                           {formatDuration(course.duration)}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className={`p-2 rounded-lg ${isDark ? 'bg-green-600' : 'bg-green-500'}`}>
//                         <BookOpen className="w-5 h-5 text-white" />
//                       </div>
//                       <div>
//                         <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                           Lessons
//                         </p>
//                         <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                           {course.courseData?.length || 0}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-600' : 'bg-purple-500'}`}>
//                         <Users className="w-5 h-5 text-white" />
//                       </div>
//                       <div>
//                         <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                           Students
//                         </p>
//                         <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                           {course.purchased.toLocaleString()}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-600' : 'bg-yellow-500'}`}>
//                         <Star className="w-5 h-5 text-white" />
//                       </div>
//                       <div>
//                         <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                           Rating
//                         </p>
//                         <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                           {course.rating}/5
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
              
//               {/* Course Category */}
//               <motion.div
//                 variants={cardVariants}
//                 initial="initial"
//                 animate="animate"
//                 className={`rounded-2xl p-6 shadow-xl ${
//                   isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
//                 }`}
//               >
//                 <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                   Category
//                 </h2>
//                 <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
//                   isDark ? 'bg-blue-600 text-blue-100' : 'bg-blue-500 text-white'
//                 }`}>
//                   {course.category}
//                 </span>
//               </motion.div>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </motion.section>
//   );
// }



"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '../../../../lib/auth';
import axios from 'axios';
import { motion } from 'framer-motion';
import BackButton from '../../../../components/courses/BackButton';
import VideoPlayer from '../../../../components/courses/VideoPlayer';
import Curriculum from '../../../../components/courses/';
import CourseStats from '../../../../components/courses/CourseStats';
import ProgressTracker from '../../../../components/courses/ProgressTracker';
import LessonNavigation from '../../../../components/courses/LessonNavigation';
import SkeletonCoursePage from '../../../../components/courses/SkeletonCoursePage';
import ErrorDisplay from '../../../../components/courses/ErrorDisplay';

// Type Definitions (reused from GetSingleCoursePage.tsx)
interface CourseInstructor {
  name: string;
  bio: string;
  avatar: string;
}

interface CourseThumbnail {
  public_id: string;
  url: string;
}

interface CourseData {
  title: string;
  videoUrl: string;
  isRequired: boolean;
  order: number;
  duration?: number;
  description?: string;
  completed?: boolean;
}

interface Course {
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
  courseData?: CourseData[];
  enrolled?: boolean;
  progress?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type CourseError = 
  | 'COURSE_NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

interface CoursePageError {
  type: CourseError;
  message: string;
}

// Animation Variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function CourseContent(): JSX.Element {
  const { token, user } = useAuth();
  const { resolvedTheme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<CoursePageError | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('main');
  const isDark = resolvedTheme === 'dark';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const courseId = useMemo(() => {
    if (typeof params.id === 'string') return params.id;
    if (Array.isArray(params.id)) return params.id[0];
    return null;
  }, [params.id]);

  const handleError = useCallback((err: any): CoursePageError => {
    if (err.response) {
      switch (err.response.status) {
        case 401:
        case 403:
          return { type: 'UNAUTHORIZED', message: 'You are not authorized to access this course content' };
        case 404:
          return { type: 'COURSE_NOT_FOUND', message: 'Course not found or you are not enrolled' };
        default:
          return { type: 'NETWORK_ERROR', message: 'Network error occurred' };
      }
    }
    return { type: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' };
  }, []);

  const fetchCourseContent = useCallback(async () => {
    if (!courseId || !token) {
      setError({ type: 'UNAUTHORIZED', message: 'Please log in to access this course' });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<ApiResponse<{ courseData: CourseData[] }>>(
        `${baseUrl}/api/v1/get-course-content/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch course content');
      }

      const courseResponse = await axios.get<ApiResponse<Course>>(`${baseUrl}/api/v1/get-course/${courseId}`);
      if (!courseResponse.data.success) {
        throw new Error(courseResponse.data.message || 'Failed to fetch course');
      }

      const courseData = {
        ...courseResponse.data.data,
        thumbnail: courseResponse.data.data.thumbnail?.url
          ? courseResponse.data.data.thumbnail
          : { public_id: `fallback-${courseId}`, url: '/images/fallback-course.jpg' },
        instructor: {
          name: courseResponse.data.data.instructor?.name || 'Unknown Instructor',
          bio: courseResponse.data.data.instructor?.bio || 'No bio available',
          avatar: courseResponse.data.data.instructor?.avatar || '/images/instructor-placeholder.jpg',
        },
        courseData: response.data.data.courseData,
        enrolled: true,
        progress: response.data.data.courseData
          ? (response.data.data.courseData.filter(lesson => lesson.completed).length /
              response.data.data.courseData.length) * 100
          : 0,
      };
      setCourse(courseData);
      if (courseData.courseData?.[0]?.videoUrl) {
        setActiveVideo(courseData.courseData[0].videoUrl);
      }
    } catch (err: any) {
      setError(handleError(err));
    } finally {
      setIsLoading(false);
    }
  }, [courseId, token, baseUrl, handleError]);

  useEffect(() => {
    fetchCourseContent();
  }, [fetchCourseContent]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSection(prev => (prev === sectionId ? null : sectionId));
  }, []);

  const handleMarkComplete = useCallback(
    async (lessonOrder: number) => {
      if (!course || !token) return;
      try {
        const response = await axios.post<ApiResponse<null>>(
          `${baseUrl}/api/v1/update-progress/${course._id}`,
          { lessonOrder, completed: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          setCourse(prev =>
            prev
              ? {
                  ...prev,
                  courseData: prev.courseData?.map(lesson =>
                    lesson.order === lessonOrder ? { ...lesson, completed: true } : lesson
                  ),
                  progress:
                    prev.courseData && prev.courseData.length > 0
                      ? (prev.courseData.filter(l => l.completed || (l.order === lessonOrder ? true : false)).length /
                          prev.courseData.length) * 100
                      : prev.progress,
                }
              : null
          );
        }
      } catch (err: any) {
        setError({ type: 'UNKNOWN_ERROR', message: 'Failed to update progress' });
      }
    },
    [course, token, baseUrl]
  );

  const handleNextLesson = useCallback(() => {
    if (!course?.courseData || !activeVideo) return;
    const currentIndex = course.courseData.findIndex(lesson => lesson.videoUrl === activeVideo);
    if (currentIndex < course.courseData.length - 1) {
      setActiveVideo(course.courseData[currentIndex + 1].videoUrl);
    }
  }, [course, activeVideo]);

  const handlePreviousLesson = useCallback(() => {
    if (!course?.courseData || !activeVideo) return;
    const currentIndex = course.courseData.findIndex(lesson => lesson.videoUrl === activeVideo);
    if (currentIndex > 0) {
      setActiveVideo(course.courseData[currentIndex - 1].videoUrl);
    }
  }, [course, activeVideo]);

  if (isLoading) {
    return <SkeletonCoursePage />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchCourseContent} />;
  }

  if (!course || !course.enrolled || !course.courseData) {
    return (
      <ErrorDisplay
        error={{ type: 'COURSE_NOT_FOUND', message: 'Course not found or you are not enrolled' }}
        onRetry={fetchCourseContent}
      />
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4 sm:px-6`}
      aria-labelledby="course-title"
    >
      <div className="max-w-7xl mx-auto">
        <div className="space-y-8">
          <BackButton />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            id="course-title"
            className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {course.name}
          </motion.h1>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 space-y-8">
              <VideoPlayer activeVideo={activeVideo} course={course} />
              <LessonNavigation
                course={course}
                activeVideo={activeVideo}
                handleNextLesson={handleNextLesson}
                handlePreviousLesson={handlePreviousLesson}
                handleMarkComplete={handleMarkComplete}
              />
              <Curriculum
                course={course}
                activeVideo={activeVideo}
                setActiveVideo={setActiveVideo}
                expandedSection={expandedSection}
                toggleSection={toggleSection}
                formatDuration={(duration: number) => {
                  const hours = Math.floor(duration / 60);
                  const minutes = duration % 60;
                  return `${hours}h ${minutes}m`;
                }}
              />
            </div>
            <div className="lg:w-1/3 space-y-6">
              <ProgressTracker progress={course.progress || 0} />
              <CourseStats
                course={course}
                formatDuration={(duration: number) => {
                  const hours = Math.floor(duration / 60);
                  const minutes = duration % 60;
                  return `${hours}h ${minutes}m`;
                }}
                renderStars={(rating: number) => (
                  Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : isDark ? 'text-gray-600' : 'text-gray-300'}`}
                    />
                  ))
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}