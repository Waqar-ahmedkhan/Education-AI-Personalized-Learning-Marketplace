
'use client';
import React, { useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import Image from 'next/image';
import StarButton from '@/components/courses/StarButton';
import CommentReply from '@/components/courses/CommentReply';
import { IComment } from '@/types/course';

interface CommentProps {
  comment: IComment;
  courseId: string;
  contentId: string;
  user: { _id: string; name: string; avatar?: string } | null;
  isAdmin: boolean;
  token: string | null;
  onStar: (questionId: string) => void;
  setCourse: React.Dispatch<React.SetStateAction<any>>;
}

const Comment: React.FC<CommentProps> = ({
  comment,
  courseId,
  contentId,
  user,
  isAdmin,
  token,
  onStar,
  setCourse,
}) => {
  const [newAnswer, setNewAnswer] = useState('');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  const handleSubmitAnswer = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newAnswer.trim() || !courseId || !contentId || !token || !user) return;
      try {
        await axios.put(
          `${baseUrl}/add-answer`,
          { answer: newAnswer, courseId, contentId, questionId: comment._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourse(prev => ({
          ...prev,
          courseData: prev.courseData.map(l =>
            l._id === contentId
              ? {
                  ...l,
                  question: l.question.map(q =>
                    q._id === comment._id
                      ? {
                          ...q,
                          questionReplies: [
                            ...(q.questionReplies || []),
                            {
                              user: { _id: user._id, name: user.name, avatar: user.avatar },
                              answer: newAnswer,
                              createdAt: new Date().toISOString(),
                            },
                          ],
                        }
                      : q
                  ),
                }
              : l
          ),
        }));
        setNewAnswer('');
      } catch (err) {
        console.error('Failed to submit answer:', err);
      }
    },
    [newAnswer, courseId, contentId, comment._id, user, token, setCourse]
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`p-4 rounded-lg ${comment.starred ? 'border-l-4 border-yellow-500 bg-yellow-500/20' : 'border-l-4 border-blue-500'} shadow-md`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Image
            src={comment.user.avatar || '/images/user-placeholder.jpg'}
            alt={comment.user.name}
            width={32}
            height={32}
            className="rounded-full"
          />
          <p className="font-semibold">{comment.user.name}</p>
          <p className="text-sm text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</p>
        </div>
        <StarButton starred={comment.starred} onClick={() => onStar(comment._id)} />
      </div>
      <p className="text-base mb-2">{comment.question}</p>
      {comment.questionReplies?.map((reply, rIndex) => (
        <CommentReply key={rIndex} reply={reply} isDark={isDark} />
      ))}
      <form onSubmit={handleSubmitAnswer} className="mt-2 flex gap-2">
        <input
          type="text"
          value={newAnswer}
          onChange={e => setNewAnswer(e.target.value)}
          placeholder={isAdmin ? 'Reply as admin...' : 'Add your answer...'}
          className={`flex-1 p-2 rounded-lg ${isDark ? 'bg-gray-700/80 text-white placeholder-gray-400' : 'bg-gray-200/80 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner`}
          disabled={!token}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className={`px-3 py-2 rounded-lg ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white shadow-lg ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!token}
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </form>
    </motion.div>
  );
};

export default Comment;