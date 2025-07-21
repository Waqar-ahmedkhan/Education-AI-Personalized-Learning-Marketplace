
'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { useTheme } from 'next-themes';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send } from 'lucide-react';
import Comment from '@/components/courses/Comment';
import {  CourseData } from '@/types/course';

interface CommentSectionProps {
  lesson: CourseData;
  courseId: string;
  user: { _id: string; name: string; avatar?: string } | null;
  isAdmin: boolean;
  token: string | null;
  setCourse: React.Dispatch<React.SetStateAction<any>>;
  setXp: React.Dispatch<React.SetStateAction<number>>;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  lesson,
  courseId,
  user,
  isAdmin,
  token,
  setCourse,
  setXp,
}) => {
  const [newQuestion, setNewQuestion] = useState('');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  const handleSubmitQuestion = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newQuestion.trim() || !courseId || !lesson._id || !token || !user) return;
      try {
        await axios.put(
          `${baseUrl}/add-question`,
          { question: newQuestion, courseId, contentId: lesson._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourse(prev => ({
          ...prev,
          courseData: prev.courseData.map(l =>
            l._id === lesson._id
              ? {
                  ...l,
                  question: [
                    ...l.question,
                    {
                      _id: `mock-${Date.now()}`,
                      user: { _id: user._id, name: user.name, avatar: user.avatar },
                      question: newQuestion,
                      questionReplies: [],
                      createdAt: new Date().toISOString(),
                      starred: false,
                    },
                  ],
                }
              : l
          ),
        }));
        setXp(prev => prev + 10);
        setNewQuestion('');
      } catch (err) {
        console.error('Failed to submit question:', err);
      }
    },
    [newQuestion, courseId, lesson._id, user, token, setCourse, setXp]
  );

  const handleStarQuestion = useCallback(
    (questionId: string) => {
      setCourse(prev => ({
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
      }));
    },
    [lesson._id, setCourse]
  );

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
      className={`rounded-2xl p-6 shadow-xl bg-gradient-to-br ${isDark ? 'from-gray-800/80 to-gray-900/80 backdrop-blur-lg' : 'from-white/80 to-gray-100/80 backdrop-blur-lg'} text-${isDark ? 'white' : 'gray-900'}`}
    >
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" /> Questions for {lesson.title}
      </h3>
      <form onSubmit={handleSubmitQuestion} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newQuestion}
          onChange={e => setNewQuestion(e.target.value)}
          placeholder="Ask a question about this lesson..."
          className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-gray-700/80 text-white placeholder-gray-400' : 'bg-gray-200/80 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner`}
          disabled={!token}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className={`px-4 py-3 rounded-lg ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center gap-2 shadow-lg ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!token}
        >
          <Send className="w-4 h-4" /> Ask
        </motion.button>
      </form>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {sortedQuestions.map(q => (
            <Comment
              key={q._id}
              comment={q}
              courseId={courseId}
              contentId={lesson._id}
              user={user}
              isAdmin={isAdmin}
              token={token}
              onStar={handleStarQuestion}
              setCourse={setCourse}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CommentSection;