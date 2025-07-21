
'use client';
import React, { useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Star, Send } from 'lucide-react'; // Import Send icon

interface IReview {
  _id?: string;
  user: { _id: string; name: string; avatar?: string };
  rating: number;
  comment: string;
  CommentReplies?: { user: { _id: string; name: string; avatar?: string }; comment: string }[];
}

interface Course {
  _id: string;
  name: string;
  reviews: IReview[];
}

interface ReviewProps {
  course: Course;
  setCourse: React.Dispatch<React.SetStateAction<Course | null>>;
  setXp: React.Dispatch<React.SetStateAction<number>>;
}

const Review: React.FC<ReviewProps> = ({ course, setCourse, setXp }) => {
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isDark = useTheme().resolvedTheme === 'dark';
  const baseUrl = 'http://localhost:8080/api/v1';
  const mockUser = { _id: 'test-user', name: 'Test User', avatar: '/images/user-placeholder.jpg' };

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
                  (prev.reviews.reduce((acc, r) => acc + r.rating, 0) + newRating) /
                  (prev.reviews.length + 1),
              }
            : prev
        );
        setXp(prev => prev + 5); // Award 5 XP for review
        setNewReview('');
        setNewRating(0);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to submit review');
      }
    },
    [newReview, newRating, course._id, setCourse, setXp]
  );

  return (
    <div
      className={`rounded-2xl p-6 shadow-xl bg-gradient-to-br ${
        isDark ? 'from-gray-800 to-gray-900' : 'from-white to-gray-100'
      } text-${isDark ? 'white' : 'gray-900'}`}
    >
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400" /> Reviews
      </h3>
      {error && (
        <div className="mb-4 p-3 bg-red-500 text-white rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}
      <form onSubmit={handleSubmitReview} className="mb-6">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newReview}
            onChange={e => setNewReview(e.target.value)}
            placeholder="Write your review..."
            className={`flex-1 p-3 rounded-lg ${
              isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-200 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
          className={`px-4 py-3 rounded-lg ${
            isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          } text-white flex items-center gap-2`}
        >
          <Send className="w-4 h-4" /> Submit Review
        </motion.button>
      </form>
      <div className="space-y-4">
        {course.reviews.map(r => (
          <div key={r._id} className="border-l-4 border-yellow-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <img
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default Review;
