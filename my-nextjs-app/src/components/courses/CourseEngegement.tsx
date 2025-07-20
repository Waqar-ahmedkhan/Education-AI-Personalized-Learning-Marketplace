"use client";

import React, { useReducer, useCallback, useMemo, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { MessageSquare, Star, Award, Trophy, Send, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { debounce } from "lodash";
import { Course, CourseData, CoursePageError } from "@/types/course";
import DeleteCourse from "@/components/courses/DeleteCourse";
import EditCourse from "@/components/courses/EditCourse";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";

interface CourseEngagementProps {
  course: Course | null;
  lesson: CourseData;
  setCourse: React.Dispatch<React.SetStateAction<Course | null>>;
  setXp: React.Dispatch<React.SetStateAction<number>>;
  setBadges: React.Dispatch<React.SetStateAction<string[]>>;
  setCertificateId: React.Dispatch<React.SetStateAction<string | null>>;
}

interface EngagementState {
  newQuestion: string;
  newAnswer: string;
  selectedQuestionId: string | null;
  newReview: string;
  newRating: number;
  newReply: string;
  selectedReviewId: string | null;
  currentQuiz: number;
  currentQuestion: number;
  selectedAnswers: number[];
  showQuizResults: boolean;
  quizScore: number;
  timeRemaining: number | null;
  error: CoursePageError | null;
  isLoading: boolean;
  isDeleting: boolean;
}

type EngagementAction =
  | { type: "SET_QUESTION"; payload: string }
  | { type: "SET_ANSWER"; payload: { id: string | null; answer: string } }
  | { type: "SET_REVIEW"; payload: string }
  | { type: "SET_RATING"; payload: number }
  | { type: "SET_REPLY"; payload: { id: string | null; reply: string } }
  | { type: "SET_QUIZ"; payload: { quiz: number; question: number; answers: number[] } }
  | { type: "SET_QUIZ_RESULTS"; payload: { score: number; show: boolean } }
  | { type: "SET_TIME_REMAINING"; payload: number | null }
  | { type: "SET_ERROR"; payload: CoursePageError | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_DELETING"; payload: boolean };

const initialState: EngagementState = {
  newQuestion: "",
  newAnswer: "",
  selectedQuestionId: null,
  newReview: "",
  newRating: 0,
  newReply: "",
  selectedReviewId: null,
  currentQuiz: 0,
  currentQuestion: 0,
  selectedAnswers: [],
  showQuizResults: false,
  quizScore: 0,
  timeRemaining: null,
  error: null,
  isLoading: false,
  isDeleting: false,
};

const engagementReducer = (state: EngagementState, action: EngagementAction): EngagementState => {
  switch (action.type) {
    case "SET_QUESTION":
      return { ...state, newQuestion: action.payload };
    case "SET_ANSWER":
      return { ...state, newAnswer: action.payload.answer, selectedQuestionId: action.payload.id };
    case "SET_REVIEW":
      return { ...state, newReview: action.payload };
    case "SET_RATING":
      return { ...state, newRating: action.payload };
    case "SET_REPLY":
      return { ...state, newReply: action.payload.reply, selectedReviewId: action.payload.id };
    case "SET_QUIZ":
      return {
        ...state,
        currentQuiz: action.payload.quiz,
        currentQuestion: action.payload.question,
        selectedAnswers: action.payload.answers,
      };
    case "SET_QUIZ_RESULTS":
      return { ...state, quizScore: action.payload.score, showQuizResults: action.payload.show };
    case "SET_TIME_REMAINING":
      return { ...state, timeRemaining: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_DELETING":
      return { ...state, isDeleting: action.payload };
    default:
      return state;
  }
};

const CourseEngagement: React.FC<CourseEngagementProps> = ({
  course,
  lesson,
  setCourse,
  setXp,
  setBadges,
  setCertificateId,
}) => {
  const [state, dispatch] = useReducer(engagementReducer, initialState);
  const { token, user, isAdmin } = useAuth();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const isDark = resolvedTheme === "dark";
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

  // Error handling utility
  const handleError = useCallback((err: unknown): CoursePageError => {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<{ message?: string }>;
      switch (axiosError.response?.status) {
        case 404:
          return { type: "COURSE_NOT_FOUND", message: axiosError.response?.data?.message || "Course or resource not found" };
        case 401:
          return { type: "UNAUTHORIZED", message: axiosError.response?.data?.message || "Unauthorized action" };
        case 400:
          return { type: "ENROLLMENT_FAILED", message: axiosError.response?.data?.message || "Invalid input provided" };
        default:
          return { type: "NETWORK_ERROR", message: axiosError.response?.data?.message || "Network error occurred" };
      }
    }
    return { type: "UNKNOWN_ERROR", message: "An unexpected error occurred" };
  }, []);

  // Debounced API call utility
  const debouncedApiCall = useCallback(
    debounce(
      async (
        url: string,
        method: "put" | "post" | "delete",
        data: any,
        successCallback: (response: any) => void,
        errorCallback?: () => void
      ) => {
        dispatch({ type: "SET_LOADING", payload: true });
        try {
          const response = await axios({
            method,
            url: `${baseUrl}/${url}`,
            data,
            headers: { Authorization: `Bearer ${token}` },
          });
          successCallback(response);
          dispatch({ type: "SET_ERROR", payload: null });
          toast.success("Action completed successfully!");
        } catch (err) {
          dispatch({ type: "SET_ERROR", payload: handleError(err) });
          errorCallback?.();
        } finally {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      },
      500
    ),
    [handleError, token]
  );

  // Handlers for various actions
  const handleSubmitQuestion = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!state.newQuestion.trim() || !course?._id) return;
      debouncedApiCall(
        "add-question",
        "put",
        { question: state.newQuestion, courseId: course._id, contentId: lesson._id },
        () => {
          setCourse(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              courseData: prev.courseData?.map(l =>
                l._id === lesson._id
                  ? {
                      ...l,
                      question: [
                        ...(l.question || []),
                        {
                          _id: `temp-${Date.now()}`,
                          user: { _id: user!._id, name: user!.name, avatar: user!.avatar || "/images/user-placeholder.jpg" },
                          question: state.newQuestion,
                          questionReplies: [],
                          createdAt: new Date().toISOString(),
                          starred: false,
                        },
                      ],
                    }
                  : l
              ) || [],
            };
          });
          setXp(prev => prev + 10);
          dispatch({ type: "SET_QUESTION", payload: "" });
        }
      );
    },
    [state.newQuestion, course, lesson._id, user, debouncedApiCall, setCourse, setXp]
  );

  const handleSubmitAnswer = useCallback(
    async (e: React.FormEvent, questionId: string) => {
      e.preventDefault();
      if (!state.newAnswer.trim() || !course?._id) return;
      debouncedApiCall(
        "add-answer",
        "put",
        { answer: state.newAnswer, courseId: course._id, contentId: lesson._id, questionId },
        () => {
          setCourse(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              courseData: prev.courseData?.map(l =>
                l._id === lesson._id
                  ? {
                      ...l,
                      question: l.question?.map(q =>
                        q._id === questionId
                          ? {
                              ...q,
                              questionReplies: [
                                ...(q.questionReplies || []),
                                {
                                  user: {
                                    _id: user!._id,
                                    name: user!.name,
                                    avatar: user!.avatar || "/images/user-placeholder.jpg",
                                  },
                                  answer: state.newAnswer,
                                  createdAt: new Date().toISOString(),
                                },
                              ],
                            }
                          : q
                      ) || [],
                    }
                  : l
              ) || [],
            };
          });
          dispatch({ type: "SET_ANSWER", payload: { id: null, answer: "" } });
        }
      );
    },
    [state.newAnswer, course, lesson._id, user, debouncedApiCall, setCourse]
  );

  const handleStarQuestion = useCallback(
    (questionId: string) => {
      setCourse(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          courseData: prev.courseData?.map(l =>
            l._id === lesson._id
              ? {
                  ...l,
                  question: l.question?.map(q =>
                    q._id === questionId ? { ...q, starred: !q.starred } : q
                  ) || [],
                }
              : l
          ) || [],
        };
      });
    },
    [lesson._id, setCourse]
  );

  const handleSubmitReview = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!state.newReview.trim() || state.newRating === 0 || !course?._id) return;
      debouncedApiCall(
        `add-review/${course._id}`,
        "put",
        { review: state.newReview, rating: state.newRating, userId: user!._id },
        () => {
          setCourse(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              reviews: [
                ...(prev.reviews || []),
                {
                  _id: `temp-review-${Date.now()}`,
                  userId: user!._id,
                  name: user!.name,
                  rating: state.newRating,
                  comment: state.newReview,
                  createdAt: new Date().toISOString(),
                  CommentReplies: [],
                },
              ],
              rating:
                ((prev.reviews?.reduce((acc, r) => acc + r.rating, 0) || 0) + state.newRating) /
                ((prev.reviews?.length || 0) + 1),
            };
          });
          setXp(prev => prev + 5);
          dispatch({ type: "SET_REVIEW", payload: "" });
          dispatch({ type: "SET_RATING", payload: 0 });
        }
      );
    },
    [state.newReview, state.newRating, course, user, debouncedApiCall, setCourse, setXp]
  );

  const handleSubmitReply = useCallback(
    async (e: React.FormEvent, reviewId: string) => {
      e.preventDefault();
      if (!state.newReply.trim() || !isAdmin || !course?._id) return;
      debouncedApiCall(
        "add-reply",
        "put",
        { comment: state.newReply, courseId: course._id, reviewId },
        () => {
          setCourse(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              reviews: prev.reviews?.map(r =>
                r._id === reviewId
                  ? {
                      ...r,
                      CommentReplies: [
                        ...(r.CommentReplies || []),
                        {
                          user: {
                            _id: user!._id,
                            name: user!.name,
                            avatar: user!.avatar || "/images/admin-placeholder.jpg",
                          },
                          comment: state.newReply,
                          createdAt: new Date().toISOString(),
                        },
                      ],
                    }
                  : r
              ) || [],
            };
          });
          dispatch({ type: "SET_REPLY", payload: { id: null, reply: "" } });
        }
      );
    },
    [state.newReply, course, user, isAdmin, debouncedApiCall, setCourse]
  );

  const handleGenerateCertificate = useCallback(async () => {
    if (!course || course.progress !== 100) {
      dispatch({
        type: "SET_ERROR",
        payload: { type: "ENROLLMENT_FAILED", message: "Complete all modules to get certificate" },
      });
      return;
    }
    debouncedApiCall(
      `generate-certificate/${course._id}`,
      "post",
      {},
      response => {
        const { certificateId } = response.data;
        setCertificateId(certificateId);
        setCourse(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            certificates: [
              ...(prev.certificates || []),
              { user: user!._id, issuedAt: new Date().toISOString(), certificateId },
            ],
          };
        });
      }
    );
  }, [course, user, debouncedApiCall, setCourse, setCertificateId]);

  const handleDownloadCertificate = useCallback(async () => {
    if (!course) return;
    try {
      const response = await axios.get(`${baseUrl}/download-certificate/${course._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate-${course.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: handleError(err) });
    }
  }, [course, token, handleError]);

  const handleDeleteCourse = useCallback(async () => {
    if (!course) return;
    dispatch({ type: "SET_DELETING", payload: true });
    debouncedApiCall(
      `delete-course/${course._id}`,
      "delete",
      {},
      () => router.push("/courses"),
      () => dispatch({ type: "SET_DELETING", payload: false })
    );
  }, [course, debouncedApiCall, router]);

  const handleEditCourse = useCallback(() => {
    if (!course) return;
    router.push(`/courses/edit/${course._id}`);
  }, [course, router]);

  const quiz = lesson.quizzes?.[state.currentQuiz];
  const question = quiz?.questions[state.currentQuestion];

  const handleQuizAnswer = useCallback(
    async (answerIndex: number) => {
      const newAnswers = [...state.selectedAnswers];
      newAnswers[state.currentQuestion] = answerIndex;
      dispatch({
        type: "SET_QUIZ",
        payload: { quiz: state.currentQuiz, question: state.currentQuestion, answers: newAnswers },
      });
    },
    [state.currentQuiz, state.currentQuestion, state.selectedAnswers]
  );

  const handleNextQuestion = useCallback(() => {
    if (!quiz) return;
    if (state.currentQuestion < quiz.questions.length - 1) {
      dispatch({
        type: "SET_QUIZ",
        payload: { quiz: state.currentQuiz, question: state.currentQuestion + 1, answers: state.selectedAnswers },
      });
    } else if (state.currentQuiz < (lesson.quizzes?.length || 0) - 1) {
      dispatch({
        type: "SET_QUIZ",
        payload: { quiz: state.currentQuiz + 1, question: 0, answers: [] },
      });
    } else {
      const totalCorrect = lesson.quizzes?.reduce((acc, q, qIdx) => {
        return acc + q.questions.reduce((qAcc, qn, qnIdx) => {
          const answerIdx = state.selectedAnswers[qnIdx];
          return qAcc + (answerIdx === parseInt(qn.correctAnswer) ? 1 : 0);
        }, 0);
      }, 0) || 0;
      const totalQuestions = lesson.quizzes?.reduce((acc, q) => acc + q.questions.length, 0) || 1;
      const finalScore = (totalCorrect / totalQuestions) * 100;
      dispatch({ type: "SET_QUIZ_RESULTS", payload: { score: finalScore, show: true } });

      if (quiz && finalScore >= quiz.passingScore) {
        debouncedApiCall(
          "track-progress",
          "post",
          { courseId: course?._id, contentId: lesson._id },
          () => {
            setCourse(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                courseData: prev.courseData?.map(l =>
                  l._id === lesson._id ? { ...l, completed: true } : l
                ) || [],
                progress: [...(prev.progress || []), { user: user!._id, contentId: lesson._id }],
              };
            });
            debouncedApiCall(
              "add-xp",
              "post",
              { courseId: course?._id, xp: 10 },
              () => {
                setXp(prev => {
                  const newXp = prev + 10;
                  if (newXp >= 100 && !course?.gamification?.find(g => g.user === user!._id)?.badges.includes("Beginner")) {
                    setBadges(prev => [...prev, "Beginner"]);
                  }
                  return newXp;
                });
              }
            );
          }
        );
      }
    }
  }, [
    state.currentQuiz,
    state.currentQuestion,
    state.selectedAnswers,
    lesson.quizzes,
    lesson._id,
    course,
    quiz,
    user,
    debouncedApiCall,
    setCourse,
    setXp,
    setBadges,
  ]);

  const handlePreviousQuestion = useCallback(() => {
    if (state.currentQuestion > 0) {
      dispatch({
        type: "SET_QUIZ",
        payload: { quiz: state.currentQuiz, question: state.currentQuestion - 1, answers: state.selectedAnswers },
      });
    }
  }, [state.currentQuiz, state.currentQuestion, state.selectedAnswers]);

  // Quiz timer
  useEffect(() => {
    if (!quiz || state.showQuizResults) return;
    const timeLimit = (quiz.timeLimit || 30) * 60;
    dispatch({ type: "SET_TIME_REMAINING", payload: timeLimit });

    const timer = setInterval(() => {
      if (state.timeRemaining && state.timeRemaining > 0) {
        dispatch({ type: "SET_TIME_REMAINING", payload: state.timeRemaining - 1 });
      } else {
        dispatch({ type: "SET_QUIZ_RESULTS", payload: { score: state.quizScore, show: true } });
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, state.showQuizResults, state.timeRemaining, state.quizScore]);

  if (!token || !user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 text-red-500 rounded-lg bg-red-500/10"
      >
        Please log in to access engagement features.
      </motion.div>
    );
  }

  if (!course || !lesson) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 text-red-500 rounded-lg bg-red-500/10"
      >
        Error: Course or lesson data is missing.
      </motion.div>
    );
  }

  const sortedQuestions = useMemo(() => {
    return [...(lesson.question || [])].sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [lesson.question]);

  const containerVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-500/50 rounded-2xl">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {state.error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-red-500 text-white rounded-lg flex items-center justify-between"
          role="alert"
        >
          <span>{state.error.message}</span>
          <button onClick={() => dispatch({ type: "SET_ERROR", payload: null })} className="underline">
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Admin Actions */}
      {isAdmin && (
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Admin Actions</h3>
          <div className="flex gap-4">
            <EditCourse courseId={course._id} onEdit={handleEditCourse} />
            <DeleteCourse courseId={course._id} onDelete={handleDeleteCourse} isDeleting={state.isDeleting} />
          </div>
        </motion.div>
      )}

      {/* Gamification and Certification */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" /> Your Progress
        </h3>
        <p className="text-lg">XP: {course.gamification?.find(g => g.user === user._id)?.xp || 0}</p>
        <p className="text-lg">Badges: {course.gamification?.find(g => g.user === user._id)?.badges?.join(", ") || "None"}</p>
        {course.certificates?.some(c => c.user === user._id) ? (
          <div className="mt-4">
            <p className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-green-400" /> Certificate Earned (ID:{" "}
              {course.certificates.find(c => c.user === user._id)?.certificateId})
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadCertificate}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors"
            >
              <Award className="w-4 h-4 inline mr-2" /> Download Certificate
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateCertificate}
            className={`mt-4 px-4 py-2 rounded-lg shadow-md ${
              course.progress !== 100 ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            } text-white`}
            disabled={course.progress !== 100}
          >
            <Award className="w-4 h-4 inline mr-2" /> Generate Certificate
          </motion.button>
        )}
      </motion.div>

      {/* Q&A Section */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Questions for {lesson.title}
        </h3>
        <form onSubmit={handleSubmitQuestion} className="mb-6 flex gap-2">
          <input
            type="text"
            value={state.newQuestion}
            onChange={e => dispatch({ type: "SET_QUESTION", payload: e.target.value })}
            placeholder="Ask a question about this lesson..."
            className="flex-1 p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!token}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-4 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={!token}
          >
            <Send className="w-4 h-4 inline mr-2" /> Ask
          </motion.button>
        </form>
        {sortedQuestions.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {sortedQuestions.map(q => (
                <motion.div
                  key={q._id}
                  variants={itemVariants}
                  className={`p-4 rounded-lg ${q.starred ? "border-l-4 border-yellow-500 bg-yellow-500/10" : "border-l-4 border-blue-500"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Image
                        src={q.user.avatar || "/images/user-placeholder.jpg"}
                        alt={q.user.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <p className="font-semibold">{q.user.name}</p>
                      <p className="text-sm text-gray-400">{formatDistanceToNow(new Date(q.createdAt))} ago</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleStarQuestion(q._id!)}
                      className={`p-1 ${q.starred ? "text-yellow-400" : "text-gray-400"}`}
                    >
                      <Star className={`w-5 h-5 ${q.starred ? "fill-current" : ""}`} />
                    </motion.button>
                  </div>
                  <p className="text-base mb-2">{q.question}</p>
                  {q.questionReplies?.map((reply, rIndex) => (
                    <div
                      key={rIndex}
                      className="ml-8 mt-2 p-3 rounded-lg bg-gray-200 dark:bg-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Image
                          src={reply.user.avatar || "/images/admin-placeholder.jpg"}
                          alt={reply.user.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <p className="text-sm font-semibold text-blue-400">
                          {reply.user.name} {reply.user._id === user._id ? "" : "(Admin)"}
                        </p>
                      </div>
                      <p className="text-sm">{reply.answer}</p>
                    </div>
                  ))}
                  <form onSubmit={e => handleSubmitAnswer(e, q._id!)} className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={state.selectedQuestionId === q._id ? state.newAnswer : ""}
                      onChange={e => dispatch({ type: "SET_ANSWER", payload: { id: q._id, answer: e.target.value } })}
                      placeholder={isAdmin ? "Reply as admin..." : "Add your answer..."}
                      className="flex-1 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!token}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                      disabled={!token}
                    >
                      Reply
                    </motion.button>
                  </form>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No questions yet. Be the first to ask!</p>
        )}
      </motion.div>

      {/* Quiz Section */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> Quizzes for {lesson.title}
        </h3>
        {lesson.quizzes?.length > 0 && quiz ? (
          <motion.div variants={itemVariants} className="p-6 rounded-lg bg-gray-100 dark:bg-gray-700">
            <h4 className="text-lg font-semibold mb-2">{quiz.title}</h4>
            <p className="text-sm mb-2">{quiz.description || "Test your knowledge with this quiz."}</p>
            <p className="text-sm mb-4">
              Passing Score: {quiz.passingScore}% | Time Remaining:{" "}
              {state.timeRemaining !== null
                ? `${Math.floor(state.timeRemaining / 60)}:${(state.timeRemaining % 60).toString().padStart(2, "0")}`
                : "No limit"}
            </p>
            {!state.showQuizResults ? (
              <div>
                <div className="flex justify-between mb-2">
                  <p>Question {state.currentQuestion + 1} of {quiz.questions.length}</p>
                  <p>Quiz {state.currentQuiz + 1} of {lesson.quizzes.length}</p>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-4 mb-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{ width: `${((state.currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                  />
                </div>
                <p className="text-base font-medium mb-4">{question?.questionText}</p>
                <div className="grid gap-2">
                  {question?.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuizAnswer(index)}
                      className={`w-full text-left p-3 rounded-lg shadow-md ${
                        state.selectedAnswers[state.currentQuestion] === index
                          ? "bg-blue-500 text-white"
                          : "bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500"
                      } transition-colors`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePreviousQuestion}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition-colors disabled:opacity-50"
                    disabled={state.currentQuestion === 0}
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextQuestion}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                  >
                    {state.currentQuestion < quiz.questions.length - 1 ? "Next" : "Submit"}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="text-lg font-semibold mb-4">
                  Quiz Results: {state.quizScore.toFixed(1)}%{" "}
                  {state.quizScore >= quiz.passingScore ? "🎉 Passed" : "😔 Try Again"}
                </h4>
                {lesson.quizzes.map((q, qIdx) =>
                  q.questions.map((qn, qnIdx) => {
                    const answerIdx = state.selectedAnswers[qnIdx];
                    return (
                      <div key={`${qIdx}-${qnIdx}`} className="mb-4">
                        <p className="font-medium">{qn.questionText}</p>
                        <p className={answerIdx === parseInt(qn.correctAnswer) ? "text-green-400" : "text-red-400"}>
                          Your Answer: {qn.options[answerIdx] || "None"}
                        </p>
                        {answerIdx !== parseInt(qn.correctAnswer) && (
                          <p className="text-green-400">Correct Answer: {qn.options[parseInt(qn.correctAnswer)]}</p>
                        )}
                      </div>
                    );
                  })
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    dispatch({ type: "SET_QUIZ", payload: { quiz: 0, question: 0, answers: [] } })
                  }
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                >
                  Retake Quiz
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No quizzes available for this lesson.</p>
        )}
      </motion.div>

      {/* Reviews Section */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" /> Reviews
        </h3>
        <form onSubmit={handleSubmitReview} className="mb-6">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={state.newReview}
              onChange={e => dispatch({ type: "SET_REVIEW", payload: e.target.value })}
              placeholder="Write your review..."
              className="flex-1 p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!token}
            />
            <select
              value={state.newRating}
              onChange={e => dispatch({ type: "SET_RATING", payload: Number(e.target.value) })}
              className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={!token}
            >
              <option value={0}>Rate (1-5)</option>
              {[1, 2, 3, 4, 5].map(r => (
                <option key={r} value={r}>
                  {r} Star{r > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={!token}
          >
            <Send className="w-4 h-4 inline mr-2" /> Submit Review
          </motion.button>
        </form>
        {course.reviews?.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {course.reviews.map(r => (
                <motion.div
                  key={r._id}
                  variants={itemVariants}
                  className="border-l-4 border-yellow-500 pl-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Image
                      src={r.user?.avatar || "/images/user-placeholder.jpg"}
                      alt={r.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <p className="font-semibold">{r.name}</p>
                    <div className="flex">
                      {Array.from({ length: r.rating }, (_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-base mb-2">{r.comment}</p>
                  {r.CommentReplies?.map((reply, rIndex) => (
                    <div
                      key={rIndex}
                      className="ml-8 mt-2 p-3 rounded-lg bg-gray-200 dark:bg-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Image
                          src={reply.user.avatar || "/images/admin-placeholder.jpg"}
                          alt={reply.user.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <p className="text-sm font-semibold text-blue-400">{reply.user.name} (Admin)</p>
                      </div>
                      <p className="text-sm">{reply.comment}</p>
                    </div>
                  ))}
                  {isAdmin && (
                    <form onSubmit={e => handleSubmitReply(e, r._id!)} className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={state.selectedReviewId === r._id ? state.newReply : ""}
                        onChange={e => dispatch({ type: "SET_REPLY", payload: { id: r._id, reply: e.target.value } })}
                        placeholder="Reply as admin..."
                        className="flex-1 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!token}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                        disabled={!token}
                      >
                        Reply
                      </motion.button>
                    </form>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to leave one!</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CourseEngagement;