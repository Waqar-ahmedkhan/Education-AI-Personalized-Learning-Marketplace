// 'use client';
// import React, { useState, useEffect, useCallback } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { useTheme } from 'next-themes';
// import { useAuth } from '../../../lib/auth'; // Import useAuth
// import { Star, Heart, Clock, Users, BookOpen, ArrowLeft, Check, Share2, Bookmark, PlayCircleIcon, PlayCircle } from 'lucide-react';
// import Image from 'next/image';
// import axios from 'axios'; // Import AxiosError
// import { motion, AnimatePresence } from 'framer-motion';

// // Course type
// interface Course {
//   _id: string;
//   title: string;
//   description: string;
//   instructor: string;
//   sections: Section[];
//   lectures: number;
//   rating: number;
//   reviews: number;
//   price: string;
//   originalPrice?: string;
//   thumbnail: string;
//   previewVideo?: string;
//   category: string;
//   level: string;
//   duration: string;
//   tag: string;
//   isNew?: boolean;
//   enrolled?: number;
//   skills?: string[];
//   lastUpdated?: string;
//   createdAt: string;
// }

// interface Section {
//   _id: string;
//   title: string;
//   lectures: Lecture[];
//   order: number;
// }

// interface Lecture {
//   _id: string;
//   title: string;
//   duration: string;
//   isPreview: boolean;
//   videoUrl: string;
//   order: number;
// }

// // API response type
// interface ApiResponse {
//   success: boolean;
//   data?: Course;
// }

// // Skeleton Loader Component
// const SkeletonCourseDetails: React.FC = () => (
//   <div className="animate-pulse max-w-7xl mx-auto p-6">
//     <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-6" />
//     <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-6" />
//     <div className="flex flex-col lg:flex-row gap-8">
//       <div className="lg:w-2/3">
//         <div className="h-80 bg-gray-300 dark:bg-gray-700 rounded-xl mb-6" />
//         <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-3" />
//         <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-6" />
//         <div className="grid grid-cols-2 gap-4">
//           <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
//           <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
//         </div>
//       </div>
//       <div className="lg:w-1/3">
//         <div className="h-56 bg-gray-300 dark:bg-gray-700 rounded-xl mb-6" />
//         <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-6" />
//         <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full" />
//       </div>
//     </div>
//   </div>
// );

// // Main Component
// export default function CourseDetails() {
//   const { token } = useAuth(); // Get token from AuthContext
//   const { resolvedTheme } = useTheme();
//   const params = useParams();
//   const router = useRouter();
//   const [course, setCourse] = useState<Course | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isFavorite, setIsFavorite] = useState<boolean>(false);
//   const [activeVideo, setActiveVideo] = useState<string | null>(null);
//   const [expandedSection, setExpandedSection] = useState<string | null>(null);
//   const isDark = resolvedTheme === 'dark';

//   // Fetch course data
//   useEffect(() => {
//     const fetchCourse = async () => {
//       try {
//         setIsLoading(true);
//         const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
//         const response = await axios.get<ApiResponse>(`${baseUrl}/api/v1/get-course-content/${params.id}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           withCredentials: true,
//         });
//         const data = response.data;
//         if (data.success && data.data) {
//           setCourse(data.data);
//           const savedFavorites = localStorage.getItem('courseFavorites');
//           if (savedFavorites) {
//             const favorites = new Set(JSON.parse(savedFavorites));
//             setIsFavorite(favorites.has(data.data._id));
//           }
//           if (data.data.sections?.[0]?.lectures?.[0]?.videoUrl) {
//             setActiveVideo(data.data.sections[0].lectures[0].videoUrl);
//           }
//         } else {
//           setError('Course not found');
//         }
//       } catch (error: unknown) {
//         if (axios.isAxiosError(error)) {
//           if (error.response?.status === 401) {
//             setError('Please log in to access this course');
//             router.push(`/forbidden?error=Please+log+in`);
//           } else if (error.response?.status === 404) {
//             setError('You are not eligible to access this course');
//           } else {
//             setError('Failed to load course details');
//           }
//         } else {
//           setError('Failed to load course details');
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     if (params.id) fetchCourse();
//   }, [params.id, router, token]);

//   // Toggle favorite
//   const toggleFavorite = useCallback(() => {
//     if (!course) return;
//     setIsFavorite((prev) => !prev);
//     const savedFavorites = localStorage.getItem('courseFavorites');
//     const favorites = savedFavorites ? new Set(JSON.parse(savedFavorites)) : new Set();
//     if (favorites.has(course._id)) {
//       favorites.delete(course._id);
//     } else {
//       favorites.add(course._id);
//     }
//     localStorage.setItem('courseFavorites', JSON.stringify([...favorites]));
//   }, [course]);

//   // Toggle section expansion
//   const toggleSection = useCallback((sectionId: string) => {
//     setExpandedSection((prev) => (prev === sectionId ? null : sectionId));
//   }, []);

//   // Render stars
//   const renderStars = useCallback(
//     (rating: number) =>
//       Array.from({ length: 5 }, (_, i) => (
//         <Star
//           key={i}
//           className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : isDark ? 'text-gray-600' : 'text-gray-300'}`}
//         />
//       )),
//     [isDark]
//   );

//   // Get tag color
//   const getTagColor = useCallback(
//     (tag: string) => {
//       const colors: Record<string, string> = {
//         'Most Popular': isDark ? 'bg-blue-600 text-blue-100' : 'bg-blue-500 text-white',
//         Bestseller: isDark ? 'bg-orange-600 text-orange-100' : 'bg-orange-500 text-white',
//         New: isDark ? 'bg-green-600 text-green-100' : 'bg-green-500 text-white',
//         'Free Course': isDark ? 'bg-purple-600 text-purple-100' : 'bg-purple-500 text-white',
//         Hot: isDark ? 'bg-red-600 text-red-100' : 'bg-red-500 text-white',
//         Featured: isDark ? 'bg-indigo-600 text-indigo-100' : 'bg-indigo-500 text-white',
//         Updated: isDark ? 'bg-teal-600 text-teal-100' : 'bg-teal-500 text-white',
//         'Limited Time': isDark ? 'bg-pink-600 text-pink-100' : 'bg-pink-500 text-white',
//       };
//       return colors[tag] || (isDark ? 'bg-gray-600 text-gray-100' : 'bg-gray-500 text-white');
//     },
//     [isDark]
//   );

//   // Format duration
//   const formatDuration = (duration: string) => {
//     const [hours, minutes] = duration.split(':');
//     return `${hours}h ${minutes}m`;
//   };

//   if (isLoading) {
//     return <SkeletonCourseDetails />;
//   }

//   if (error || !course) {
//     return (
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center p-6`}
//       >
//         <div className="text-center">
//           <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{error || 'Course Not Found'}</h2>
//           <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
//             {error === 'You are not eligible to access this course'
//               ? 'It looks like you are not enrolled in this course.'
//               : 'It looks like the course you are looking for does not exist or there was an error.'}
//           </p>
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => router.push('/courses')}
//             className={`px-6 py-3 rounded-lg text-sm font-medium ${
//               isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
//             } shadow-lg`}
//             aria-label="Back to courses"
//           >
//             Back to Courses
//           </motion.button>
//         </div>
//       </motion.div>
//     );
//   }

//   return (
//     <motion.section
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4 sm:px-6`}
//       aria-labelledby="course-title"
//     >
//       <div className="max-w-7xl mx-auto">
//         {/* Back Button */}
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="mb-6">
//           <button
//             onClick={() => router.push('/courses')}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
//               isDark ? 'bg-gray-800 text MOZ-gray-200 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             } shadow-sm transition-all`}
//             aria-label="Back to courses"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back to Courses
//           </button>
//         </motion.div>

//         {/* Hero Section */}
//         <div className={`relative rounded-xl p-6 mb-8 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
//           <div className="flex flex-col md:flex-row gap-6">
//             <div className="md:w-2/3">
//               <div className="flex items-center gap-3 mb-3">
//                 <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTagColor(course.tag)}`}>{course.tag}</span>
//                 {course.isNew && (
//                   <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">New</span>
//                 )}
//               </div>
//               <h1 id="course-title" className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
//                 {course.title}
//               </h1>
//               <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{course.description}</p>
//               <div className="flex flex-wrap items-center gap-4">
//                 <div className="flex items-center gap-2">
//                   <span className="text-lg font-medium">{course.rating}</span>
//                   <div className="flex gap-1">{renderStars(course.rating)}</div>
//                   <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
//                     ({course.reviews.toLocaleString()} reviews)
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Users className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
//                   <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
//                     {course.enrolled?.toLocaleString() || '0'} students
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Clock className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
//                   <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
//                     Last updated: {new Date(course.lastUpdated || course.createdAt).toLocaleDateString()}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div className="md:w-1/3 flex flex-col items-end gap-4">
//               <div className="flex items-center gap-3">
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={toggleFavorite}
//                   className={`p-2 rounded-full ${isFavorite ? 'bg-red-500/10 text-red-500' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:shadow-md transition-all`}
//                   aria-label={isFavorite ? `Remove ${course.title} from favorites` : `Add ${course.title} to favorites`}
//                 >
//                   <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
//                 </motion.button>
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   className={`p-2 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:shadow-md transition-all`}
//                   aria-label="Share this course"
//                 >
//                   <Share2 className="w-5 h-5" />
//                 </motion.button>
//               </div>
//               <div className="text-right">
//                 <span className={`text-3xl font-bold ${course.price === 'Free' ? 'text-green-600' : 'text-blue-600'}`}>
//                   {course.price}
//                 </span>
//                 {course.originalPrice && (
//                   <span className={`text-lg line-through ml-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//                     {course.originalPrice}
//                   </span>
//                 )}
//               </div>
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 className={`w-full py-3 rounded-lg text-sm font-medium ${
//                   isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
//                 } shadow-md transition-all`}
//                 aria-label={course.price === 'Free' ? `Start learning ${course.title}` : `Enroll in ${course.title}`}
//               >
//                 {course.price === 'Free' ? 'Start Learning' : 'Enroll Now'}
//               </motion.button>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Left Column - Course Content */}
//           <div className="lg:w-2/3 space-y-8">
//             {/* Video Player Section */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//               className={`rounded-xl overflow-hidden shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
//             >
//               <div className="relative aspect-video bg-black">
//                 {activeVideo ? (
//                   <iframe
//                     src={activeVideo}
//                     className="w-full h-full"
//                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                     allowFullScreen
//                   />
//                 ) : (
//                   <div className="flex items-center justify-center w-full h-full">
//                     <div className="text-center p-6">
//                       <PlayCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
//                       <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Select a lecture to preview</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <div className="p-6">
//                 <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Course Preview</h2>
//                 <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{course.description}</p>
//                 <div className="flex flex-wrap gap-4">
//                   <div className="flex items-center gap-2">
//                     <Clock className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
//                     <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                       Duration: {formatDuration(course.duration)}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <BookOpen className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
//                     <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                       {course.sections.length} Sections
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <PlayCircle className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
//                     <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
//                       {course.lectures} Lectures
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Course Curriculum */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//               className={`rounded-xl overflow-hidden shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
//             >
//               <div className="p-6">
//                 <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Course Curriculum</h2>
//                 <div className="space-y-4">
//                   {course.sections.map((section) => (
//                     <div key={section._id} className="border rounded-lg overflow-hidden">
//                       <button
//                         onClick={() => toggleSection(section._id)}
//                         className={`w-full flex justify-between items-center p-4 text-left ${
//                           isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
//                         } transition-colors`}
//                       >
//                         <div className="flex items-center gap-3">
//                           <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{section.title}</h3>
//                           <span
//                             className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
//                           >
//                             {section.lectures.length} lectures
//                           </span>
//                         </div>
//                         <svg
//                           className={`w-5 h-5 transform transition-transform ${
//                             expandedSection === section._id ? 'rotate-180' : ''
//                           } ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                         </svg>
//                       </button>
//                       <AnimatePresence>
//                         {expandedSection === section._id && (
//                           <motion.div
//                             initial={{ opacity: 0, height: 0 }}
//                             animate={{ opacity: 1, height: 'auto' }}
//                             exit={{ opacity: 0, height: 0 }}
//                             transition={{ duration: 0.3 }}
//                             className={`${isDark ? 'bg-gray-800' : 'bg-white'}`}
//                           >
//                             <ul className="divide-y divide-gray-200 dark:divide-gray-700">
//                               {section.lectures.map((lecture) => (
//                                 <li key={lecture._id} className="px-4 py-3">
//                                   <button
//                                     onClick={() => setActiveVideo(lecture.videoUrl)}
//                                     className={`w-full flex items-center gap-3 text-left ${
//                                       activeVideo === lecture.videoUrl
//                                         ? isDark
//                                           ? 'text-blue-400'
//                                           : 'text-blue-600'
//                                         : isDark
//                                         ? 'text-gray-300 hover:text-white'
//                                         : 'text-gray-600 hover:text-gray-900'
//                                     } transition-colors`}
//                                   >
//                                     <PlayCircleIcon className="w-4 h-4 flex-shrink-0" />
//                                     <span className="truncate">{lecture.title}</span>
//                                     {lecture.isPreview && (
//                                       <span className="ml-auto text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-500">
//                                         Preview
//                                       </span>
//                                     )}
//                                     <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
//                                       {lecture.duration}
//                                     </span>
//                                   </button>
//                                 </li>
//                               ))}
//                             </ul>
//                           </motion.div>
//                         )}
//                       </AnimatePresence>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </motion.div>

//             {/* What You'll Learn Section */}
//             {course.skills && course.skills.length > 0 && (
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: 0.3 }}
//                 className={`rounded-xl overflow-hidden shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
//               >
//                 <div className="p-6">
//                   <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                     What You&apos;ll Learn
//                   </h2>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {course.skills.map((skill, index) => (
//                       <div key={index} className="flex items-start gap-3">
//                         <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
//                         <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{skill}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </motion.div>
//             )}

//             {/* Instructor Section */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.4 }}
//               className={`rounded-xl overflow-hidden shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
//             >
//               <div className="p-6">
//                 <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                   About the Instructor
//                 </h2>
//                 <div className="flex flex-col sm:flex-row gap-6">
//                   <div className="flex-shrink-0">
//                     <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden">
//                       <Image
//                         src="/images/instructor-placeholder.jpg"
//                         alt="Instructor"
//                         width={80}
//                         height={80}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   </div>
//                   <div>
//                     <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                       {course.instructor}
//                     </h3>
//                     <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Senior Developer & Educator</p>
//                     <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
//                       With over 10 years of experience in software development and teaching, {course.instructor} has helped
//                       thousands of students master modern technologies. Their practical approach to teaching focuses on
//                       real-world applications.
//                     </p>
//                     <div className="flex items-center gap-4">
//                       <div className="flex items-center gap-2">
//                         <Star className={`w-5 h-5 text-yellow-400 ${isDark ? 'fill-current' : ''}`} />
//                         <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>4.9 Rating</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Users className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
//                         <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>12K Students</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <BookOpen className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
//                         <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>8 Courses</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>

//           {/* Right Column - Course Details */}
//           <div className="lg:w-1/3 space-y-6">
//             {/* Course Highlights */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.5, delay: 0.5 }}
//               className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
//             >
//               <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Course Highlights</h2>
//               <div className="space-y-4">
//                 <div className="flex items-center gap-3">
//                   <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                     <Clock className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
//                   </div>
//                   <div>
//                     <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Duration</h3>
//                     <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                       {formatDuration(course.duration)}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                     <BookOpen className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
//                   </div>
//                   <div>
//                     <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Sections</h3>
//                     <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                       {course.sections.length} modules
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                     <PlayCircle className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
//                   </div>
//                   <div>
//                     <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Lectures</h3>
//                     <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                       {course.lectures} lessons
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                     <Users className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
//                   </div>
//                   <div>
//                     <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Enrolled</h3>
//                     <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
//                       {course.enrolled?.toLocaleString() || '0'} students
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                     <Bookmark className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
//                   </div>
//                   <div>
//                     <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Level</h3>
//                     <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.level}</p>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Course Includes */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.5, delay: 0.6 }}
//               className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
//             >
//               <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>This Course Includes</h2>
//               <ul className="space-y-3">
//                 <li className="flex items-center gap-3">
//                   <Check className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
//                   <span className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Full lifetime access</span>
//                 </li>
//                 <li className="flex items-center gap-3">
//                   <Check className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
//                   <span className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Certificate of completion</span>
//                 </li>
//                 <li className="flex items-center gap-3">
//                   <Check className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
//                   <span className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Downloadable resources</span>
//                 </li>
//                 <li className="flex items-center gap-3">
//                   <Check className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
//                   <span className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Access on mobile and TV</span>
//                 </li>
//                 <li className="flex items-center gap-3">
//                   <Check className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
//                   <span className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Assignments</span>
//                 </li>
//               </ul>
//             </motion.div>

//             {/* Share Course */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.5, delay: 0.7 }}
//               className={`rounded-xl p-6 shadow-lg ${isDark ? '実は-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
//             >
//               <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Share This Course</h2>
//               <div className="flex items-center gap-3">
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   className={`p-3 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
//                   aria-label="Share on Twitter"
//                 >
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
//                   </svg>
//                 </motion.button>
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   className={`p-3 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
//                   aria-label="Share on Facebook"
//                 >
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
//                   </svg>
//                 </motion.button>
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   className={`p-3 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
//                   aria-label="Share on LinkedIn"
//                 >
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.027-3.037-1.852-3.037-1.854 0-2.137 1.446-2.137 2.941v5.665H9.352V9.0h3.414v1.561h.048c.476-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433c-1.144 0-2.063-.93-2.063-2.065 0-1.135.92-2.065 2.063-2.065 1.143 0 2.063.93 2.063 2.065 0 1.135-.92 2.065-2.063 2.065zm1.777 13.019H3.56V9.0h3.554v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
//                   </svg>
//                 </motion.button>
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   className={`p-3 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
//                   aria-label="Share on WhatsApp"
//                 >
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M16.6 14c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.9.9-.2.2-.3.2-.5.1-1.1-.5-2-1-2.7-2.4-.2-.5 0-1 .1-1.2s.3-.3.5-.5c.2-.2.3-.5.3-.7s0-.5-.1-.7-.5-.9-1-1.2c-.3-.1-.5-.1-.7-.1s-.4 0-.6.1c-.2.1-.9.5-1.4 1.4-.5 1-.6 2.1-.1 3.2s1.1 2.1 2.1 2.8c1.3.8 2.6 1.1 4 1.1.4 0 .8 0 1.2-.1.5-.1 1.5-.6 1.7-1.2.2-.5.2-.9.1-1zm-4.6-9.8C6.5 4.2 2.2 8.5 2.2 14c0 5.5 4.5 10 10 10s10-4.5 10-10-4.5-10-10-10zm5.7 13.1c-.1.3-.4.6-.8.7-1.1.3-2.2.2-3.4-.2-1.7-.6-3.2-1.7-4.4-3.1-.7-.8-1.2-1.7-1.5-2.7-.2-.6-.2-1.2-.1-1.8.1-.3.2-.5.4-.7.1-.1.2-.2.3-.3.1-.1.1-.2.2-.3.1-.1.1-.2 0-.3-.2-.3-.4-.6-.5-.9-.2-.3-.3-.6-.5-.9-.1-.2-.3-.3-.5-.3-.2 0-.3 0-.5.1-.5.2-1 .7-1.2 1.3-.3.8-.3 1.7 0 2.6.3 1.1 1 2.1 1.8 3 .8.9 1.8 1.6 2.9 2.1.9.4 1.9.6 2.9.6.4 0 .8 0 1.2-.1.3-.1.6-.3.8-.6.2-.3.3-.6.3-.9 0-.2-.1-.4-.3-.5z" />
//                   </svg>
//                 </motion.button>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     </motion.section>
//   );
// }


"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '../../../lib/auth';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import BackButton from './BackButton';
import HeroSection from './HeroSection';
import CourseActionPanel from './CourseActionPanel';
import VideoPlayer from './VideoPlayer';
import Curriculum from './Curriculum';
import Description from './Description';
import InstructorInfo from './InstructorInfo';
import CourseStats from './CourseStats';
import CourseCategory from './CourseCategory';
import SkeletonCoursePage from './SkeletonCoursePage';
import ErrorDisplay from './ErrorDisplay';
import { Star } from 'lucide-react';

// Type Definitions
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
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface EnrollmentResponse {
  success: boolean;
  sessionId?: string;
  message?: string;
}

type CourseError = 
  | 'COURSE_NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'ENROLLMENT_FAILED'
  | 'PAYMENT_FAILED'
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

export default function GetSingleCoursePage(): JSX.Element {
  const { token } = useAuth();
  const { resolvedTheme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<CoursePageError | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const isDark = resolvedTheme === 'dark';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const courseId = useMemo(() => {
    if (typeof params.id === 'string') return params.id;
    if (Array.isArray(params.id)) return params.id[0];
    return null;
  }, [params.id]);

  const isAdmin = useMemo(() => user?.role === 'admin', [user?.role]);

  const handleError = useCallback((err: any): CoursePageError => {
    if (err.response) {
      switch (err.response.status) {
        case 401:
          return { type: 'UNAUTHORIZED', message: 'Please log in to access this course' };
        case 403:
          return { type: 'UNAUTHORIZED', message: 'You are not authorized to access this course' };
        case 404:
          return { type: 'COURSE_NOT_FOUND', message: 'Course not found' };
        default:
          return { type: 'NETWORK_ERROR', message: 'Network error occurred' };
      }
    }
    return { type: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' };
  }, []);

  const fetchCourse = useCallback(async () => {
    if (!courseId) {
      setError({ type: 'COURSE_NOT_FOUND', message: 'Invalid course ID' });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<ApiResponse<Course>>(`${baseUrl}/api/v1/get-course/${courseId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch course');
      }

      const courseData = {
        ...response.data.data,
        thumbnail: response.data.data.thumbnail?.url
          ? response.data.data.thumbnail
          : { public_id: `fallback-${courseId}`, url: '/images/fallback-course.jpg' },
        instructor: {
          name: response.data.data.instructor?.name || 'Unknown Instructor',
          bio: response.data.data.instructor?.bio || 'No bio available',
          avatar: response.data.data.instructor?.avatar || '/images/instructor-placeholder.jpg',
        },
      };
      setCourse(courseData);

      try {
        const savedFavorites = localStorage.getItem('courseFavorites');
        if (savedFavorites) {
          const favorites = new Set<string>(JSON.parse(savedFavorites));
          setIsFavorite(favorites.has(courseData._id));
        }
      } catch (e) {
        console.warn('Failed to parse favorites from localStorage');
      }

      if (token) {
        try {
          const contentResponse = await axios.get<ApiResponse<{ courseData: CourseData[] }>>(
            `${baseUrl}/api/v1/get-course-content/${courseId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (contentResponse.data.success) {
            setCourse(prev => prev ? {
              ...prev,
              courseData: contentResponse.data.data.courseData,
              enrolled: true,
            } : null);
            if (contentResponse.data.data.courseData?.[0]?.videoUrl) {
              setActiveVideo(contentResponse.data.data.courseData[0].videoUrl);
            }
          }
        } catch (contentErr) {
          if (contentErr.response?.status === 404) {
            setCourse(prev => prev ? { ...prev, enrolled: false } : null);
          }
        }
      }
    } catch (err: any) {
      setError(handleError(err));
    } finally {
      setIsLoading(false);
    }
  }, [courseId, token, baseUrl, handleError]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const toggleFavorite = useCallback(() => {
    if (!course) return;
    setIsFavorite(prev => !prev);
    try {
      const savedFavorites = localStorage.getItem('courseFavorites');
      const favorites = savedFavorites ? new Set<string>(JSON.parse(savedFavorites)) : new Set<string>();
      if (favorites.has(course._id)) {
        favorites.delete(course._id);
      } else {
        favorites.add(course._id);
      }
      localStorage.setItem('courseFavorites', JSON.stringify(Array.from(favorites)));
    } catch (err) {
      console.warn('Failed to update favorites in localStorage');
    }
  }, [course]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSection(prev => (prev === sectionId ? null : sectionId));
  }, []);

  const handleEnroll = useCallback(async () => {
    if (!course || !token) {
      router.push('/login');
      return;
    }

    setIsEnrolling(true);
    try {
      if (course.price === 0) {
        const response = await axios.post<ApiResponse<null>>(
          `${baseUrl}/api/v1/enroll-course/${course._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          setCourse(prev => prev ? { ...prev, enrolled: true } : null);
          router.push(`/courses/${course._id}/content`);
        } else {
          throw new Error(response.data.message || 'Enrollment failed');
        }
      } else {
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
        if (!stripe) {
          throw new Error('Stripe failed to load');
        }
        const response = await axios.post<EnrollmentResponse>(
          `${baseUrl}/api/v1/create-checkout-session`,
          { courseId: course._id, price: course.price },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success && response.data.sessionId) {
          const { error } = await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
          if (error) {
            throw new Error(error.message || 'Payment redirection failed');
          }
        } else {
          throw new Error(response.data.message || 'Failed to create checkout session');
        }
      }
    } catch (err: any) {
      setError({
        type: 'ENROLLMENT_FAILED',
        message: err.message || 'Enrollment failed. Please try again.',
      });
    } finally {
      setIsEnrolling(false);
    }
  }, [course, token, router, baseUrl]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const courseIdFromUrl = urlParams.get('course_id');
    if (sessionId && courseIdFromUrl && courseId === courseIdFromUrl && token) {
      axios
        .post<ApiResponse<null>>(
          `${baseUrl}/api/v1/verify-payment`,
          { sessionId, courseId: courseIdFromUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(response => {
          if (response.data.success) {
            setCourse(prev => prev ? { ...prev, enrolled: true } : null);
            router.replace(`/courses/${courseId}/content`);
          } else {
            setError({ type: 'PAYMENT_FAILED', message: 'Payment verification failed' });
          }
        })
        .catch(() => {
          setError({ type: 'PAYMENT_FAILED', message: 'Payment verification failed' });
        });
    }
  }, [courseId, token, router, baseUrl]);

  const handleEdit = useCallback(() => {
    if (course) {
      router.push(`/courses/edit/${course._id}`);
    }
  }, [course, router]);

  const handleDelete = useCallback(async () => {
    if (!course || !token) return;
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    setIsDeleting(true);
    try {
      const response = await axios.delete<ApiResponse<null>>(`${baseUrl}/api/v1/delete-course`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { courseId: course._id },
      });
      if (response.data.success) {
        router.push('/courses');
      } else {
        throw new Error(response.data.message || 'Failed to delete course');
      }
    } catch (err: any) {
      setError({ type: 'UNKNOWN_ERROR', message: err.message || 'Failed to delete course' });
    } finally {
      setIsDeleting(false);
    }
  }, [course, token, router, baseUrl]);

  if (isLoading) {
    return <SkeletonCoursePage />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchCourse} />;
  }

  if (!course) {
    return <ErrorDisplay error={{ type: 'COURSE_NOT_FOUND', message: 'Course not found' }} onRetry={fetchCourse} />;
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
          <HeroSection
            course={course}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
            renderStars={(rating: number) => (
              Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : isDark ? 'text-gray-600' : 'text-gray-300'}`}
                />
              ))
            )}
            formatDuration={(duration: number) => {
              const hours = Math.floor(duration / 60);
              const minutes = duration % 60;
              return `${hours}h ${minutes}m`;
            }}
            getLevelColor={(level: string) => {
              switch (level) {
                case 'Beginner':
                  return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
                case 'Intermediate':
                  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
                case 'Advanced':
                  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
                default:
                  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
              }
            }}
          />
          <CourseActionPanel
            course={course}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
            isEnrolling={isEnrolling}
            handleEnroll={handleEnroll}
            isAdmin={isAdmin}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            isDeleting={isDeleting}
            formatDuration={(duration: number) => {
              const hours = Math.floor(duration / 60);
              const minutes = duration % 60;
              return `${hours}h ${minutes}m`;
            }}
          />
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 space-y-8">
              {course.enrolled && course.courseData && (
                <>
                  <VideoPlayer activeVideo={activeVideo} course={course} />
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
                </>
              )}
              {!course.enrolled && <Description course={course} />}
              <InstructorInfo instructor={course.instructor} />
            </div>
            <div className="lg:w-1/3 space-y-6">
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
              <CourseCategory category={course.category} />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}