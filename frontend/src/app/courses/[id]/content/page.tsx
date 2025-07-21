
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import axios, { AxiosError } from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '@/components/courses/BackButton';
import VideoPlayer from '@/components/courses/VideoPlayer';
import Curriculum from '@/components/courses/Curriculum';
import CourseStats from '@/components/courses/CourseStats';
import ProgressTracker from '@/components/courses/ProgressTracker';
import LessonNavigation from '@/components/courses/LessonNavigation';
import SkeletonCoursePage from '@/components/courses/SkeletonCoursePage';
import ErrorDisplay from '@/components/courses/ErrorDisplay';
import CourseInteraction from '@/components/courses/CourseEngegement'; // Import new component
import { Star, BookOpen, Link as LinkIcon, Award, Trophy, User, Send } from 'lucide-react';

// Type Definitions (unchanged except for IComment)
interface CourseInstructor {
  name: string;
  bio: string;
  avatar: string;
}

interface CourseThumbnail {
  public_id: string;
  url: string;
}

interface ILink {
  title: string;
  url: string;
}

interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface IQuiz {
  title: string;
  description: string;
  questions: IQuizQuestion[];
  passingScore: number;
  timeLimit: number;
}

interface IComment {
  _id?: string;
  user: { _id: string; name: string; avatar?: string };
  question: string;
  questionReplies: { user: { _id: string; name: string; avatar?: string }; answer: string }[];
  createdAt: Date;
  starred?: boolean; // Added for star system
}

interface IReview {
  _id?: string;
  user: { _id: string; name: string; avatar?: string };
  rating: number;
  comment: string;
  CommentReplies?: { user: { _id: string; name: string; avatar?: string }; comment: string }[];
}

interface CourseData {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  question: IComment[];
  order: number;
  isRequired: boolean;
  additionalResources: ILink[];
  quizzes: IQuiz[];
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
  courseData: CourseData[];
  demoUrl?: string;
  progress?: number;
  reviews: IReview[];
  certificates?: { user: string; issuedAt: Date; certificateId: string }[];
  gamification?: { user: string; xp: number; badges: string[] }[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type CourseError =
  | 'COURSE_NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

interface CoursePageError {
  type: CourseError;
  message: string;
}

// Mock User for Testing
const mockUser = { _id: 'test-user', name: 'Test User', avatar: '/images/user-placeholder.jpg' };

// Review Component (unchanged)
interface ReviewProps {
  reviews: IReview[];
  onSubmitReview: (review: string, rating: number) => void;
  onSubmitReply: (reviewId: string, comment: string) => void;
}

const Review: React.FC<ReviewProps> = ({ reviews, onSubmitReview, onSubmitReply }) => {
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [newReply, setNewReply] = useState('');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const isDark = useTheme().resolvedTheme === 'dark';

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.trim() && newRating > 0) {
      onSubmitReview(newReview, newRating);
      setNewReview('');
      setNewRating(0);
    }
  };

  const handleSubmitReply = (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    if (newReply.trim()) {
      onSubmitReply(reviewId, newReply);
      setNewReply('');
      setSelectedReviewId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-6 shadow-xl bg-gradient-to-br ${isDark ? 'from-gray-800 to-gray-900' : 'from-white to-gray-100'} text-${isDark ? 'white' : 'gray-900'}`}
    >
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Star className="w-6 h-6 text-yellow-400" /> Reviews
      </h3>
      <form onSubmit={handleSubmitReview} className="mb-6">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Write your review..."
            className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-200 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <select
            value={newRating}
            onChange={(e) => setNewRating(Number(e.target.value))}
            className={`p-3 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'}`}
          >
            <option value={0}>Rate (1-5)</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className={`px-4 py-3 rounded-lg ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center gap-2`}
        >
          <Send className="w-4 h-4" > Submit Review</Send>
        </motion.button>
      </form>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r._id} className="border-l-4 border-yellow-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-gray-400" />
              <p className="font-semibold">{r.user.name}</p>
              <div className="flex">{Array.from({ length: r.rating }, (_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />)}</div>
            </div>
            <p className="text-base mb-2">{r.comment}</p>
            {r.CommentReplies?.map((reply, rIndex) => (
              <div key={rIndex} className={`ml-6 mt-2 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-blue-400" />
                  <p className="text-sm font-semibold text-blue-400">{reply.user.name} (Admin)</p>
                </div>
                <p className="text-sm">{reply.comment}</p>
              </div>
            ))}
            <form
              onSubmit={(e) => handleSubmitReply(e, r._id!)}
              className="mt-2 flex gap-2"
            >
              <input
                type="text"
                value={selectedReviewId === r._id ? newReply : ''}
                onChange={(e) => {
                  setSelectedReviewId(r._id!);
                  setNewReply(e.target.value);
                }}
                placeholder="Reply as admin..."
                className={`flex-1 p-2 rounded-lg ${isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-200 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className={`px-3 py-2 rounded-lg ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                Reply
              </motion.button>
            </form>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Main CourseContent Component
export default function CourseContent(): React.JSX.Element {
  const { resolvedTheme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<CoursePageError | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('main');
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const isDark = resolvedTheme === 'dark';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const courseId = useMemo(() => {
    if (typeof params.id === 'string') return params.id;
    if (Array.isArray(params.id)) return params.id[0];
    return null;
  }, [params.id]);

  const handleError = useCallback((axiosError: unknown): CoursePageError => {
    if (axios.isAxiosError(axiosError)) {
      const error = axiosError as AxiosError;
      switch (error.response?.status) {
        case 404:
          return { type: 'COURSE_NOT_FOUND', message: 'Course not found' };
        default:
          return { type: 'NETWORK_ERROR', message: 'Network error occurred. Please try again.' };
      }
    }
    return { type: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' };
  }, []);

  const fetchCourseContent = useCallback(async () => {
    if (!courseId) {
      setError({ type: 'COURSE_NOT_FOUND', message: 'Invalid course ID' });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch course details
      const courseResponse = await axios.get<ApiResponse<Course>>(`${baseUrl}/api/v1/get-course-content/${courseId}`);
      if (!courseResponse.data.success) {
        throw new Error(courseResponse.data.message || 'Failed to fetch course');
      }

      // Fetch course content (full access for free course)
      const contentResponse = await axios.get<ApiResponse<{ courseData: CourseData[] }>>(
        `${baseUrl}/api/v1/get-course-content/${courseId}`
      );
      if (!contentResponse.data.success) {
        throw new Error(contentResponse.data.message || 'Failed to fetch course content');
      }

      const courseData: Course = {
        ...courseResponse.data.data,
        thumbnail: courseResponse.data.data.thumbnail?.url
          ? courseResponse.data.data.thumbnail
          : { public_id: `fallback-${courseId}`, url: '/images/fallback-course.jpg' },
        instructor: {
          name: courseResponse.data.data.instructor?.name || 'Unknown Instructor',
          bio: courseResponse.data.data.instructor?.bio || 'No bio available',
          avatar: courseResponse.data.data.instructor?.avatar || '/images/instructor-placeholder.jpg',
        },
        courseData: contentResponse.data.data.courseData.map(lesson => ({
          ...lesson,
          question: lesson.question || [],
          completed: lesson.completed ?? false,
        })),
        reviews: courseResponse.data.data.reviews || [],
        certificates: courseResponse.data.data.certificates || [],
        gamification: courseResponse.data.data.gamification || [],
        progress: contentResponse.data.data.courseData
          ? (contentResponse.data.data.courseData.filter(lesson => lesson.completed).length /
              contentResponse.data.data.courseData.length) * 100
          : 0,
      };

      setCourse(courseData);
      setXp(courseData.gamification?.find(g => g.user === mockUser._id)?.xp || 0);
      setBadges(courseData.gamification?.find(g => g.user === mockUser._id)?.badges || []);
      if (courseData.courseData?.[0]?.videoUrl) {
        setActiveVideo(courseData.courseData[0].videoUrl);
      } else if (courseData.demoUrl) {
        setActiveVideo(courseData.demoUrl);
      }
    } catch (axiosError: unknown) {
      setError(handleError(axiosError));
    } finally {
      setIsLoading(false);
    }
  }, [courseId, baseUrl, handleError]);

  useEffect(() => {
    fetchCourseContent();
  }, [fetchCourseContent]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSection(prev => (prev === sectionId ? null : sectionId));
  }, []);

  const handleMarkComplete = useCallback(
    async (contentId: string) => {
      // Mock trackProgress for testing
      setCourse(prev =>
        prev
          ? {
              ...prev,
              courseData: prev.courseData?.map(lesson =>
                lesson._id === contentId ? { ...lesson, completed: true } : lesson
              ),
              progress:
                prev.courseData && prev.courseData.length > 0
                  ? (prev.courseData.filter(l => l._id === contentId ? true : l.completed).length /
                      prev.courseData.length) * 100
                  : prev.progress,
            }
          : null
      );
      // Mock addGamificationXP (add 10 XP per lesson)
      setXp(prev => {
        const newXp = prev + 10;
        if (newXp >= 100 && !badges.includes('Beginner')) {
          setBadges([...badges, 'Beginner']);
        }
        return newXp;
      });
    },
    [badges]
  );

  const handleQuizComplete = useCallback(
    async (score: number, contentId: string) => {
      if (score >= 70) {
        await handleMarkComplete(contentId);
        // Mock addGamificationXP (add 10 XP for passing quiz)
        setXp(prev => {
          const newXp = prev + 10;
          if (newXp >= 100 && !badges.includes('Beginner')) {
            setBadges([...badges, 'Beginner']);
          }
          return newXp;
        });
      }
    },
    [handleMarkComplete, badges]
  );

  const handleSubmitQuestion = useCallback(
    (contentId: string) => async (question: string) => {
      // Mock addQuestion for testing
      setCourse(prev =>
        prev
          ? {
              ...prev,
              courseData: prev.courseData?.map(lesson =>
                lesson._id === contentId
                  ? {
                      ...lesson,
                      question: [
                        ...(lesson.question || []),
                        {
                          _id: `mock-${Date.now()}`,
                          user: mockUser,
                          question,
                          questionReplies: [
                            {
                              user: { _id: 'admin', name: 'Admin', avatar: '/images/admin-placeholder.jpg' },
                              answer: 'This is a mock admin response for testing.',
                            },
                          ],
                          createdAt: new Date(),
                          starred: false,
                        },
                      ],
                    }
                  : lesson
              ),
            }
          : null
      );
    },
    []
  );

  const handleSubmitAnswer = useCallback(
    (contentId: string) => async (questionId: string, answer: string) => {
      // Mock addAnswer for testing
      setCourse(prev =>
        prev
          ? {
              ...prev,
              courseData: prev.courseData?.map(lesson =>
                lesson._id === contentId
                  ? {
                      ...lesson,
                      question: lesson.question.map(q =>
                        q._id === questionId
                          ? {
                              ...q,
                              questionReplies: [
                                ...(q.questionReplies || []),
                                { user: { _id: 'admin', name: 'Admin', avatar: '/images/admin-placeholder.jpg' }, answer },
                              ],
                            }
                          : q
                      ),
                    }
                  : lesson
              ),
            }
          : null
      );
    },
    []
  );

  const handleStarQuestion = useCallback(
    (contentId: string) => async (questionId: string) => {
      // Mock starQuestion for testing
      setCourse(prev =>
        prev
          ? {
              ...prev,
              courseData: prev.courseData?.map(lesson =>
                lesson._id === contentId
                  ? {
                      ...lesson,
                      question: lesson.question.map(q =>
                        q._id === questionId ? { ...q, starred: !q.starred } : q
                      ),
                    }
                  : lesson
              ),
            }
          : null
      );
    },
    []
  );

  const handleSubmitReview = useCallback(
    async (review: string, rating: number) => {
      // Mock addReview for testing
      setCourse(prev =>
        prev
          ? {
              ...prev,
              reviews: [
                ...(prev.reviews || []),
                {
                  _id: `mock-review-${Date.now()}`,
                  user: mockUser,
                  rating,
                  comment: review,
                  CommentReplies: [],
                },
              ],
              rating:
                prev.reviews
                  ? (prev.reviews.reduce((acc, r) => acc + r.rating, 0) + rating) / (prev.reviews.length + 1)
                  : rating,
            }
          : null
      );
      // Mock addGamificationXP (add 5 XP for review)
      setXp(prev => prev + 5);
    },
    []
  );

  const handleSubmitReply = useCallback(
    async (reviewId: string, comment: string) => {
      // Mock addReplyToReview for testing
      setCourse(prev =>
        prev
          ? {
              ...prev,
              reviews: prev.reviews.map(r =>
                r._id === reviewId
                  ? {
                      ...r,
                      CommentReplies: [
                        ...(r.CommentReplies || []),
                        { user: { _id: 'admin', name: 'Admin', avatar: '/images/admin-placeholder.jpg' }, comment },
                      ],
                    }
                  : r
              ),
            }
          : null
      );
    },
    []
  );

  const handleGenerateCertificate = useCallback(async () => {
    if (!course) return;
    const completedCount = course.courseData.filter(l => l.completed).length;
    if (completedCount !== course.courseData.length) {
      setError({ type: 'UNKNOWN_ERROR', message: 'Complete all modules to get certificate' });
      return;
    }
    // Mock generateCertificate for testing
    const newCertificateId = `mock-cert-${Date.now()}`;
    setCertificateId(newCertificateId);
    setCourse(prev =>
      prev
        ? {
            ...prev,
            certificates: [
              ...(prev.certificates || []),
              { user: mockUser._id, issuedAt: new Date(), certificateId: newCertificateId },
            ],
          }
        : null
    );
    // Mock downloadCertificatePDF
    alert('Certificate generated! In production, this would download a PDF.');
  }, [course]);

  const formatDuration = useCallback((duration: number): string => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  }, []);

  const renderStars = useCallback((rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : isDark ? 'text-gray-600' : 'text-gray-300'}`}
      />
    ));
  }, [isDark]);

  if (isLoading) {
    return <SkeletonCoursePage />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchCourseContent} />;
  }

  if (!course) {
    return (
      <ErrorDisplay
        error={{ type: 'COURSE_NOT_FOUND', message: 'Course not found' }}
        onRetry={fetchCourseContent}
      />
    );
  }

  return (
    <motion.section
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
      }}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-screen bg-gradient-to-b ${isDark ? 'from-gray-900 to-gray-800' : 'from-gray-50 to-gray-200'} py-12 px-4 sm:px-6 lg:px-8`}
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
            className={`text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${isDark ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'}`}
          >
            {course.name}
          </motion.h1>
          {/* Gamification Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 shadow-xl bg-gradient-to-br ${isDark ? 'from-gray-800 to-gray-900' : 'from-white to-gray-100'} text-${isDark ? 'white' : 'gray-900'}`}
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" /> Your Progress
            </h2>
            <p className="text-lg">XP: {xp}</p>
            <p className="text-lg">Badges: {badges.length > 0 ? badges.join(', ') : 'None'}</p>
            {certificateId && (
              <p className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-green-400" /> Certificate Earned (ID: {certificateId})
              </p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateCertificate}
              className={`mt-4 px-4 py-3 rounded-lg ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white flex items-center gap-2`}
            >
              <Award className="w-4 h-4" /> Generate Certificate
            </motion.button>
          </motion.div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl overflow-hidden shadow-2xl"
              >
                <VideoPlayer activeVideo={activeVideo} course={course} />
              </motion.div>
              <LessonNavigation
                course={course}
                activeVideo={activeVideo}
                handleNextLesson={() => {
                  if (!course?.courseData || !activeVideo) return;
                  const currentIndex = course.courseData.findIndex(lesson => lesson.videoUrl === activeVideo);
                  if (currentIndex < course.courseData.length - 1) {
                    setActiveVideo(course.courseData[currentIndex + 1].videoUrl);
                  }
                }}
                handlePreviousLesson={() => {
                  if (!course?.courseData || !activeVideo) return;
                  const currentIndex = course.courseData.findIndex(lesson => lesson.videoUrl === activeVideo);
                  if (currentIndex > 0) {
                    setActiveVideo(course.courseData[currentIndex - 1].videoUrl);
                  }
                }}
                handleMarkComplete={handleMarkComplete}
              />
              <Curriculum
                course={course}
                activeVideo={activeVideo}
                setActiveVideo={setActiveVideo}
                expandedSection={expandedSection}
                toggleSection={toggleSection}
                formatDuration={formatDuration}
              />
              {/* Additional Resources */}
              {course.courseData?.some(lesson => lesson.additionalResources?.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-6 shadow-xl bg-gradient-to-br ${isDark ? 'from-gray-800 to-gray-900' : 'from-white to-gray-100'} text-${isDark ? 'white' : 'gray-900'}`}
                >
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="w-6 h-6" /> Additional Resources
                  </h2>
                  <div className="grid gap-4">
                    {course.courseData?.map(lesson =>
                      lesson.additionalResources?.map(resource => (
                        <a
                          key={resource.url}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <LinkIcon className="w-4 h-4" />
                          {resource.title}
                        </a>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
              {/* Interaction Section (Replaces Quiz and QuestionAnswer) */}
              {course.courseData?.map(lesson => (
                <CourseInteraction
                  key={lesson._id}
                  lesson={lesson}
                  onSubmitQuestion={handleSubmitQuestion(lesson._id)}
                  onSubmitAnswer={handleSubmitAnswer(lesson._id)}
                  onStarQuestion={handleStarQuestion(lesson._id)}
                  onCompleteQuiz={handleQuizComplete}
                />
              ))}
              {/* Reviews */}
              <Review
                reviews={course.reviews}
                onSubmitReview={handleSubmitReview}
                onSubmitReply={handleSubmitReply}
              />
            </div>
            <div className="lg:w-1/3 space-y-6">
              <ProgressTracker progress={course.progress || 0} />
              <CourseStats
                course={course}
                formatDuration={formatDuration}
                renderStars={renderStars}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
