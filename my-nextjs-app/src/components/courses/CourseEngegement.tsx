
'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { useTheme } from 'next-themes';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MessageSquare, Star, Award, Trophy, Send, User, CheckCircle } from 'lucide-react';
import Image from 'next/image';

// Type Definitions (Aligned with backend)
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
  starred?: boolean;
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
  quizzes: IQuiz[];
  question: IComment[];
  completed?: boolean;
}

interface Course {
  _id: string;
  name: string;
  courseData: CourseData[];
  reviews: IReview[];
  certificates?: { user: string; issuedAt: Date; certificateId: string }[];
  gamification?: { user: string; xp: number; badges: string[] }[];
  progress?: number;
}

interface CourseEngagementProps {
  course: Course | null;
  lesson: CourseData;
  setCourse: React.Dispatch<React.SetStateAction<Course | null>>;
  setXp: React.Dispatch<React.SetStateAction<number>>;
  setBadges: React.Dispatch<React.SetStateAction<string[]>>;
  setCertificateId: React.Dispatch<React.SetStateAction<string | null>>;
}

const CourseEngagement: React.FC<CourseEngagementProps> = ({
  course,
  lesson,
  setCourse,
  setXp,
  setBadges,
  setCertificateId,
}) => {
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [newReply, setNewReply] = useState('');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isDark = useTheme().resolvedTheme === 'dark';
  const baseUrl = 'http://localhost:8080/api/v1';
  const mockUser = { _id: 'test-user', name: 'Test User', avatar: '/images/user-placeholder.jpg' };

  // Exit early if course or lesson is undefined
  if (!course || !lesson) {
    return (
      <div className="p-6 text-red-500">
        Error: Course or lesson data is missing.
      </div>
    );
  }

  // Handle question submission
  const handleSubmitQuestion = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newQuestion.trim() || !course._id || !lesson._id) return;
      try {
        const response = await axios.put(
          `${baseUrl}/add-question`,
          { question: newQuestion, courseId: course._id, contentId: lesson._id },
          { headers: { 'user-id': mockUser._id } }
        );
        setCourse(prev =>
          prev
            ? {
                ...prev,
                courseData: prev.courseData.map(l =>
                  l._id === lesson._id
                    ? {
                        ...l,
                        question: [
                          ...l.question,
                          {
                            _id: `mock-${Date.now()}`,
                            user: mockUser,
                            question: newQuestion,
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
                    : l
                ),
              }
            : prev
        );
        setXp(prev => prev + 10);
        setNewQuestion('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to submit question');
      }
    },
    [newQuestion, course._id, lesson._id, setCourse, setXp]
  );

  // Handle answer submission
  const handleSubmitAnswer = useCallback(
    async (e: React.FormEvent, questionId: string) => {
      e.preventDefault();
      if (!newAnswer.trim() || !course._id || !lesson._id) return;
      try {
        await axios.put(
          `${baseUrl}/add-answer`,
          { answer: newAnswer, courseId: course._id, contentId: lesson._id, questionId },
          { headers: { 'user-id': mockUser._id } }
        );
        setCourse(prev =>
          prev
            ? {
                ...prev,
                courseData: prev.courseData.map(l =>
                  l._id === lesson._id
                    ? {
                        ...l,
                        question: l.question.map(q =>
                          q._id === questionId
                            ? {
                                ...q,
                                questionReplies: [
                                  ...(q.questionReplies || []),
                                  { user: { _id: 'admin', name: 'Admin', avatar: '/images/admin-placeholder.jpg' }, answer: newAnswer },
                                ],
                              }
                            : q
                        ),
                      }
                    : l
                ),
              }
            : prev
        );
        setNewAnswer('');
        setSelectedQuestionId(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to submit answer');
      }
    },
    [newAnswer, course._id, lesson._id, setCourse]
  );

  // Handle star question
  const handleStarQuestion = useCallback(
    (questionId: string) => {
      setCourse(prev =>
        prev
          ? {
              ...prev,
              courseData: prev.courseData.map(l =>
                l._id === lesson._id
                  ? {
                      ...l,
                      question: l.question.map(q =>
                        q._id === questionId ? { ...q, starred: !q.starred } : q
                      ),
                    }
                  : l
              ),
            }
          : prev
      );
    },
    [lesson._id, setCourse]
  );

  // Handle quiz answer
  const quiz = lesson.quizzes[currentQuiz];
  const question = quiz?.questions[currentQuestion];
  const handleQuizAnswer = useCallback(
    async (answerIndex: number) => {
      setSelectedAnswers([...selectedAnswers, answerIndex]);
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else if (currentQuiz < lesson.quizzes.length - 1) {
        setCurrentQuiz(currentQuiz + 1);
        setCurrentQuestion(0);
        setSelectedAnswers([]);
      } else {
        const totalCorrect = lesson.quizzes.reduce((acc, q, qIdx) => {
          return acc + q.questions.reduce((qAcc, qn, qnIdx) => {
            return qAcc + (selectedAnswers[qnIdx] === qn.correctAnswer ? 1 : 0);
          }, 0);
        }, 0);
        const totalQuestions = lesson.quizzes.reduce((acc, q) => acc + q.questions.length, 0);
        const finalScore = (totalCorrect / totalQuestions) * 100;
        setQuizScore(finalScore);
        setShowQuizResults(true);
        if (finalScore >= quiz.passingScore) {
          try {
            await axios.post(
              `${baseUrl}/add-xp`,
              { courseId: course._id, xp: 10 },
              { headers: { 'user-id': mockUser._id } }
            );
            setCourse(prev =>
              prev
                ? {
                    ...prev,
                    courseData: prev.courseData.map(l =>
                      l._id === lesson._id ? { ...l, completed: true } : l
                    ),
                    progress:
                      prev.courseData.filter(l => (l._id === lesson._id ? true : l.completed)).length /
                      prev.courseData.length * 100,
                  }
                : prev
            );
            setXp(prev => {
              const newXp = prev + 10;
              if (newXp >= 100 && !course.gamification?.find(g => g.user === mockUser._id)?.badges.includes('Beginner')) {
                setBadges(prev => [...prev, 'Beginner']);
              }
              return newXp;
            });
          } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update gamification');
          }
        }
      }
    },
    [currentQuiz, currentQuestion, selectedAnswers, lesson.quizzes, lesson._id, course._id, quiz.passingScore, setCourse, setXp, setBadges]
  );

  // Handle review submission
  const handleSubmitReview = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newReview.trim() || newRating === 0 || !course._id) return;
      try {
        await axios.put(
          `${baseUrl}/add-review/${course._id}`,
          { review: newReview, rating: newRating, userId: mockUser._id },
          { headers: { 'user-id': mockUser._id } }
        );
        setCourse(prev =>
          prev
            ? {
                ...prev,
                reviews: [
                  ...prev.reviews,
                  {
                    _id: `mock-review-${Date.now()}`,
                    user: mockUser,
                    rating: newRating,
                    comment: newReview,
                    CommentReplies: [],
                  },
                ],
                rating:
                  (prev.reviews.reduce((acc, r) => acc + r.rating, 0) + newRating) / (prev.reviews.length + 1),
              }
            : prev
        );
        setXp(prev => prev + 5);
        setNewReview('');
        setNewRating(0);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to submit review');
      }
    },
    [newReview, newRating, course._id, setCourse, setXp]
  );

  // Handle reply to review
  const handleSubmitReply = useCallback(
    async (e: React.FormEvent, reviewId: string) => {
      e.preventDefault();
      if (!newReply.trim() || !course._id) return;
      try {
        await axios.put(
          `${baseUrl}/add-reply`,
          { comment: newReply, courseId: course._id, reviewId },
          { headers: { 'user-id': mockUser._id } }
        );
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
                          { user: { _id: 'admin', name: 'Admin', avatar: '/images/admin-placeholder.jpg' }, comment: newReply },
                        ],
                      }
                    : r
                ),
              }
            : prev
        );
        setNewReply('');
        setSelectedReviewId(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to submit reply');
      }
    },
    [newReply, course._id, setCourse]
  );

  // Handle generate certificate
  const handleGenerateCertificate = useCallback(async () => {
    if (!course._id) return;
    try {
      const response = await axios.post(
        `${baseUrl}/generate-certificate/${course._id}`,
        {},
        { headers: { 'user-id': mockUser._id } }
      );
      const { certificateId } = response.data;
      setCertificateId(certificateId);
      setCourse(prev =>
        prev
          ? {
              ...prev,
              certificates: [
                ...(prev.certificates || []),
                { user: mockUser._id, issuedAt: new Date(), certificateId },
              ],
            }
          : prev
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate certificate');
    }
  }, [course._id, setCourse, setCertificateId]);

  // Handle download certificate
  const handleDownloadCertificate = useCallback(async () => {
    if (!course._id) return;
    try {
      const response = await axios.get(`${baseUrl}/download-certificate/${course._id}`, {
        headers: { 'user-id': mockUser._id },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${course.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to download certificate');
    }
  }, [course._id, course.name]);

  // Sort questions: starred first, then by createdAt
  const sortedQuestions = useMemo(() => {
    return [...lesson.question].sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [lesson.question]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-6 shadow-xl bg-gradient-to-br ${isDark ? 'from-gray-800 to-gray-900' : 'from-white to-gray-100'} text-${isDark ? 'white' : 'gray-900'}`}
    >
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-400" /> Engagement: Q&A, Quizzes, Reviews, and Certification
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500 text-white rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Gamification and Certification */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" /> Your Progress
        </h3>
        <p className="text-lg">XP: {course.gamification?.find(g => g.user === mockUser._id)?.xp || 0}</p>
        <p className="text-lg">
          Badges: {course.gamification?.find(g => g.user === mockUser._id)?.badges.join(', ') || 'None'}
        </p>
        {course.certificates?.some(c => c.user === mockUser._id) ? (
          <div className="mt-4">
            <p className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-green-400" /> Certificate Earned (ID: {course.certificates.find(c => c.user === mockUser._id)?.certificateId})
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadCertificate}
              className={`mt-2 px-4 py-2 rounded-lg ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white flex items-center gap-2`}
            >
              <Award className="w-4 h-4" /> Download Certificate
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateCertificate}
            className={`mt-4 px-4 py-2 rounded-lg ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white flex items-center gap-2`}
            disabled={course.progress !== 100}
          >
            <Award className="w-4 h-4" /> Generate Certificate
          </motion.button>
        )}
      </div>

      {/* Q&A Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Questions for {lesson.title}
        </h3>
        <form onSubmit={handleSubmitQuestion} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            placeholder="Ask a question about this lesson..."
            className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-200 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className={`px-4 py-3 rounded-lg ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center gap-2`}
          >
            <Send className="w-4 h-4" /> Ask
          </motion.button>
        </form>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sortedQuestions.map(q => (
            <motion.div
              key={q._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-lg ${q.starred ? 'border-l-4 border-yellow-500 bg-opacity-20 bg-yellow-500' : 'border-l-4 border-blue-500'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img
                    src={q.user.avatar || '/images/user-placeholder.jpg'}
                    alt={q.user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <p className="font-semibold">{q.user.name}</p>
                  <p className="text-sm text-gray-400">{new Date(q.createdAt).toLocaleDateString()}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleStarQuestion(q._id!)}
                  className={`p-1 ${q.starred ? 'text-yellow-400' : 'text-gray-400'}`}
                >
                  <Star className={`w-5 h-5 ${q.starred ? 'fill-current' : ''}`} />
                </motion.button>
              </div>
              <p className="text-base mb-2">{q.question}</p>
              {q.questionReplies?.map((reply, rIndex) => (
                <div
                  key={rIndex}
                  className={`ml-8 mt-2 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={reply.user.avatar || '/images/admin-placeholder.jpg'}
                      alt={reply.user.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <p className="text-sm font-semibold text-blue-400">{reply.user.name} (Admin)</p>
                  </div>
                  <p className="text-sm">{reply.answer}</p>
                </div>
              ))}
              <form
                onSubmit={e => handleSubmitAnswer(e, q._id!)}
                className="mt-2 flex gap-2"
              >
                <input
                  type="text"
                  value={selectedQuestionId === q._id ? newAnswer : ''}
                  onChange={e => {
                    setSelectedQuestionId(q._id!);
                    setNewAnswer(e.target.value);
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
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quiz Section */}
      {lesson.quizzes?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> Quizzes for {lesson.title}
          </h3>
          {quiz && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              <h4 className="text-lg font-semibold mb-2">{quiz.title}</h4>
              <p className="text-sm mb-2">{quiz.description}</p>
              <p className="text-sm mb-4">
                Passing Score: {quiz.passingScore}% | Time Limit: {quiz.timeLimit} minutes
              </p>
              {!showQuizResults ? (
                <div>
                  <div className="flex justify-between mb-2">
                    <p>
                      Question {currentQuestion + 1} of {quiz.questions.length}
                    </p>
                    <p>
                      Quiz {currentQuiz + 1} of {lesson.quizzes.length}
                    </p>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2.5 mb-4">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{
                        width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-base mb-4">{question.question}</p>
                  <div className="grid gap-2">
                    {question.options.map((option, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuizAnswer(index)}
                        className={`w-full text-left p-3 rounded-lg ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-white hover:bg-gray-100'} transition-colors shadow`}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-semibold mb-4">
                    Quiz Results: {quizScore.toFixed(1)}%{' '}
                    {quizScore >= quiz.passingScore ? '🎉 Passed' : '😔 Try Again'}
                  </h4>
                  {lesson.quizzes.map((q, qIdx) =>
                    q.questions.map((qn, qnIdx) => (
                      <div key={`${qIdx}-${qnIdx}`} className="mb-4">
                        <p className="font-medium">{qn.question}</p>
                        <p
                          className={
                            selectedAnswers[qnIdx] === qn.correctAnswer
                              ? 'text-green-400'
                              : 'text-red-400'
                          }
                        >
                          Your Answer: {qn.options[selectedAnswers[qnIdx]]}
                        </p>
                        {selectedAnswers[qnIdx] !== qn.correctAnswer && (
                          <p className="text-green-400">
                            Correct Answer: {qn.options[qn.correctAnswer]}
                          </p>
                        )}
                        <p className="text-sm text-gray-400">Explanation: {qn.explanation}</p>
                      </div>
                    ))
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCurrentQuiz(0);
                      setCurrentQuestion(0);
                      setSelectedAnswers([]);
                      setShowQuizResults(false);
                      setQuizScore(0);
                    }}
                    className={`mt-4 px-4 py-2 rounded-lg ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  >
                    Retake Quiz
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Reviews Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" /> Reviews
        </h3>
        <form onSubmit={handleSubmitReview} className="mb-6">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newReview}
              onChange={e => setNewReview(e.target.value)}
              placeholder="Write your review..."
              className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-200 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <select
              value={newRating}
              onChange={e => setNewRating(Number(e.target.value))}
              className={`p-3 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'}`}
            >
              <option value={0}>Rate (1-5)</option>
              {[1, 2, 3, 4, 5].map(r => (
                <option key={r} value={r}>
                  {r} Star{r > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className={`px-4 py-3 rounded-lg ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center gap-2`}
          >
            <Send className="w-4 h-4" /> Submit Review
          </motion.button>
        </form>
        <div className="space-y-4">
          {course.reviews.map(r => (
            <div key={r._id} className="border-l-4 border-yellow-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src={r.user.avatar || '/images/user-placeholder.jpg'}
                  alt={r.user.name}
                  className="w-8 h-8 rounded-full"
                />
                <p className="font-semibold">{r.user.name}</p>
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
                  className={`ml-8 mt-2 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Image
                      src={reply.user.avatar || '/images/admin-placeholder.jpg'}
                      alt={reply.user.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <p className="text-sm font-semibold text-blue-400">{reply.user.name} (Admin)</p>
                  </div>
                  <p className="text-sm">{reply.comment}</p>
                </div>
              ))}
              <form
                onSubmit={e => handleSubmitReply(e, r._id!)}
                className="mt-2 flex gap-2"
              >
                <input
                  type="text"
                  value={selectedReviewId === r._id ? newReply : ''}
                  onChange={e => {
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
      </div>
    </motion.div>
  );
};

export default CourseEngagement;
