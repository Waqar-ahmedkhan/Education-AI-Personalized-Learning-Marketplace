
'use client';
import React, { useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send } from 'lucide-react';
import Image from 'next/image';
import { IReview } from '@/types/course';

interface ReviewSectionProps {
  reviews: IReview[];
  courseId: string;
  user: { _id: string; name: string; avatar?: string } | null;
  isAdmin: boolean;
  token: string | null;
  setCourse: React.Dispatch<React.SetStateAction<any>>;
  setXp: React.Dispatch<React.SetStateAction<number>>;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  reviews,
  courseId,
  user,
  isAdmin,
  token,
  setCourse,
  setXp,
}) => {
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [newReply, setNewReply] = useState('');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  const handleSubmitReview = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newReview.trim() || newRating === 0 || !courseId || !token || !user) return;
      try {
        await axios.put(
          `${baseUrl}/add-review/${courseId}`,
          { review: newReview, rating: newRating, userId: user._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourse(prev => ({
          ...prev,
          reviews: [
            ...prev.reviews,
            {
              _id: `mock-review-${Date.now()}`,
              user: { _id: user._id, name: user.name, avatar: user.avatar },
              rating: newRating,
              comment: newReview,
              CommentReplies: [],
            },
          ],
          rating:
            (prev.reviews.reduce((acc: number, r: IReview) => acc + r.rating, 0) + newRating) /
            (prev.reviews.length + 1),
        }));
        setXp(prev => prev + 5);
        setNewReview('');
        setNewRating(0);
      } catch (err) {
        console.error('Failed to submit review:', err);
      }
    },
    [newReview, newRating, courseId, user, token, setCourse, setXp]
  );

  const handleSubmitReply = useCallback(
    async (e: React.FormEvent, reviewId: string) => {
      e.preventDefault();
      if (!newReply.trim() || !courseId || !isAdmin || !token || !user) return;
      try {
        await axios.put(
          `${baseUrl}/add-reply`,
          { comment: newReply, courseId, reviewId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourse(prev => ({
          ...prev,
          reviews: prev.reviews.map(r =>
            r._id === reviewId
              ? {
                  ...r,
                  CommentReplies: [
                    ...(r.CommentReplies || []),
                    {
                      user: { _id: user._id, name: user.name, avatar: user.avatar },
                      comment: newReply,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : r
          ),
        }));
        setNewReply('');
        setSelectedReviewId(null);
      } catch (err) {
        console.error('Failed to submit reply:', err);
      }
    },
    [newReply, courseId, isAdmin, user, token, setCourse]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-6 shadow-xl bg-gradient-to-br ${isDark ? 'from-gray-800/80 to-gray-900/80 backdrop-blur-lg' : 'from-white/80 to-gray-100/80 backdrop-blur-lg'} text-${isDark ? 'white' : 'gray-900'}`}
    >
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
            className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-gray-700/80 text-white placeholder-gray-400' : 'bg-gray-200/80 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner`}
            disabled={!token}
          />
          <select
            value={newRating}
            onChange={e => setNewRating(Number(e.target.value))}
            className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/80 text-white' : 'bg-gray-200/80 text-gray-900'} shadow-inner`}
            disabled={!token}
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
          className={`px-4 py-3 rounded-lg ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center gap-2 shadow-lg ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!token}
        >
          <Send className="w-4 h-4" /> Submit Review
        </motion.button>
      </form>
      <div className="space-y-4">
        <AnimatePresence>
          {reviews.map(r => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="border-l-4 border-yellow-500 pl-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src={r.user.avatar || '/images/user-placeholder.jpg'}
                  alt={r.user.name}
                  width={32}
                  height={32}
                  className="rounded-full"
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
                  className={`ml-8 mt-2 p-3 rounded-lg ${isDark ? 'bg-gray-700/80' : 'bg-gray-200/80'} shadow-sm`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Image
                      src={reply.user.avatar || '/images/admin-placeholder.jpg'}
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
                <form
                  onSubmit={e => handleSubmitReply(e, r._id)}
                  className="mt-2 flex gap-2"
                >
                  <input
                    type="text"
                    value={selectedReviewId === r._id ? newReply : ''}
                    onChange={e => {
                      setSelectedReviewId(r._id);
                      setNewReply(e.target.value);
                    }}
                    placeholder="Reply as admin..."
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
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ReviewSection;