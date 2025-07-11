'use client';
import React, { useState, Dispatch, SetStateAction } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Share2,
  PlayCircle,
  Award,
  CheckCircle,
  Loader2,
  Clock,
  Users,
  Star,
  Download,
  Bookmark,
  Globe,
  DollarSign,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import AdminControls from './AdminControls';
import { Course } from '@/types/course';
import { useAuth } from '@/lib/auth';

interface CourseActionPanelProps {
  course: Course;
  isFavorite: boolean;
  toggleFavorite: () => void;
  isEnrolling: boolean;
  setIsEnrolling: Dispatch<SetStateAction<boolean>>;
  handleEnrollSuccess: () => void;
  isAdmin: boolean;
  handleEdit: () => void;
  handleDelete: () => void;
  isDeleting: boolean;
  formatDuration: (duration: number) => string;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const shimmerAnimation = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

const CheckoutForm: React.FC<{
  course: Course;
  clientSecret: string;
  setIsEnrolling: Dispatch<SetStateAction<boolean>>;
  setPaymentError: Dispatch<SetStateAction<string | null>>;
  handleEnrollSuccess: () => void;
}> = ({ course, clientSecret, setIsEnrolling, setPaymentError, handleEnrollSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || !token) {
      setPaymentError('Authentication required. Please log in.');
      setIsEnrolling(false);
      return;
    }

    setIsEnrolling(true);
    setPaymentError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        const response = await axios.post(
          `${baseUrl}/api/v1/create-order`,
          {
            courseId: course._id,
            payment_info: { id: paymentIntent.id },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to create order');
        }

        handleEnrollSuccess();
      } else {
        throw new Error('Payment not successful');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setPaymentError(err.message || 'Failed to process payment');
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: resolvedTheme === 'dark' ? '#ffffff' : '#000000',
              '::placeholder': {
                color: resolvedTheme === 'dark' ? '#9ca3af' : '#6b7280',
              },
            },
            invalid: {
              color: '#ef4444',
            },
          },
        }}
      />
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={!stripe || !elements}
        className={`w-full py-5 px-8 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-xl relative overflow-hidden ${
          resolvedTheme === 'dark'
            ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700'
            : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700'
        }`}
      >
        <div className="relative z-10 flex items-center justify-center gap-3">
          <DollarSign className="w-6 h-6" />
          <span>Pay Now</span>
        </div>
      </motion.button>
    </form>
  );
};

const CourseActionPanel: React.FC<CourseActionPanelProps> = ({
  course,
  isFavorite,
  toggleFavorite,
  isEnrolling,
  setIsEnrolling,
  handleEnrollSuccess,
  isAdmin,
  handleEdit,
  handleDelete,
  isDeleting,
  formatDuration,
}) => {
  const { resolvedTheme, theme } = useTheme();
  const { token } = useAuth();
  const router = useRouter();
  const isDark = resolvedTheme === 'dark';
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const discountPercentage = course.price > 0 && course.estimatedPrice
    ? Math.round(((course.price - course.estimatedPrice) / course.price) * 100)
    : 0;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const handleEnroll = async () => {
    if (!token) {
      console.log('No token, redirecting to /auth/login');
      router.push('/auth/login');
      return;
    }

    setIsEnrolling(true);
    setPaymentError(null);

    try {
      if (course.price === 0) {
        const response = await axios.post(
          `${baseUrl}/api/v1/enroll-course/${course._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to enroll in free course');
        }

        handleEnrollSuccess();
      } else {
        const response = await axios.post(
          `${baseUrl}/api/v1/new-payment`,
          { amount: (course.estimatedPrice || course.price) * 100 }, // Convert to cents
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to create payment intent');
        }

        setClientSecret(response.data.client_secret);
      }
    } catch (err: any) {
      console.error('Enrollment error:', err);
      setPaymentError(err.message || 'Failed to process enrollment');
      setIsEnrolling(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="md:w-1/3"
    >
      <div
        className={`p-8 rounded-3xl backdrop-blur-sm border transition-all duration-300 shadow-2xl ${
          isDark
            ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50'
            : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFavorite}
              className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
                isFavorite
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/25'
                  : isDark
                  ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 hover:from-gray-600 hover:to-gray-700 shadow-gray-700/25'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 shadow-gray-300/25'
              }`}
              aria-label={isFavorite ? `Remove ${course.name} from favorites` : `Add ${course.name} to favorites`}
            >
              <Heart className={`w-6 h-6 transition-all duration-300 ${isFavorite ? 'fill-current' : ''}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
                isDark
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-600/25'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-blue-500/25'
              }`}
              aria-label="Share this course"
            >
              <Share2 className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
                isDark
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-600/25'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/25'
              }`}
              aria-label="Bookmark this course"
            >
              <Bookmark className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            {course.estimatedPrice && course.estimatedPrice < course.price ? (
              <div className="flex items-baseline justify-center gap-3">
                <span className={`line-through text-2xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ${course.price}
                </span>
                <motion.span
                  variants={shimmerAnimation}
                  animate="animate"
                  className={`text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent`}
                  style={{
                    backgroundSize: '200% 100%',
                    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                  }}
                >
                  ${course.estimatedPrice}
                </motion.span>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                >
                  Save {discountPercentage}%
                </motion.div>
              </div>
            ) : (
              <motion.span
                className={`text-5xl font-bold ${course.price === 0 ? 'text-green-600' : isDark ? 'text-blue-400' : 'text-blue-600'}`}
              >
                {course.price === 0 ? 'Free' : `$${course.price}`}
              </motion.span>
            )}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {course.price === 0 ? 'Free access • No payment required' : 'One-time payment • Lifetime access'}
          </motion.p>
          {paymentError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm mt-2"
            >
              {paymentError}
            </motion.p>
          )}
        </div>

        {clientSecret && !course.enrolled ? (
          <Elements stripe={stripePromise}>
            <CheckoutForm
              course={course}
              clientSecret={clientSecret}
              setIsEnrolling={setIsEnrolling}
              setPaymentError={setPaymentError}
              handleEnrollSuccess={handleEnrollSuccess}
            />
          </Elements>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={course.enrolled ? () => router.push(`/course/${course._id}/content`) : handleEnroll}
            disabled={course.enrolled || isEnrolling || paymentLoading}
            className={`w-full py-5 px-8 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-xl relative overflow-hidden ${
              course.enrolled
                ? isDark
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white cursor-default'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-default'
                : isEnrolling || paymentLoading
                ? isDark
                  ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed'
                : isDark
                ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-blue-600/25 hover:shadow-purple-600/40'
                : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-blue-600/25 hover:shadow-purple-600/40'
            }`}
            aria-label={course.enrolled ? 'Go to course content' : course.price === 0 ? `Start ${course.name}` : `Enroll in ${course.name}`}
          >
            {!course.enrolled && !isEnrolling && !paymentLoading && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                }}
              />
            )}
            <div className="relative z-10">
              {isEnrolling || paymentLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : course.enrolled ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="w-6 h-6" />
                  <span>Go to Course</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  {course.price === 0 ? (
                    <>
                      <PlayCircle className="w-6 h-6" />
                      <span>Start Learning Free</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-6 h-6" />
                      <span>Enroll Now</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.button>
        )}

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <AdminControls
              courseId={course._id}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            What's Included
          </h3>
          <div className="space-y-4">
            <motion.div whileHover={{ x: 5 }} className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
                <PlayCircle className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {course.courseData?.length || 0} HD Video Lessons
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  High-quality content
                </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ x: 5 }} className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-green-600/20' : 'bg-green-100'}`}>
                <Clock className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div>
                <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {formatDuration(course.duration)} Total Content
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Self-paced learning
                </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ x: 5 }} className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-600/20' : 'bg-purple-100'}`}>
                <Globe className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div>
                <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Lifetime Access
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Learn at your own pace
                </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ x: 5 }} className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-600/20' : 'bg-yellow-100'}`}>
                <Award className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
              <div>
                <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Certificate of Completion
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Shareable credential
                </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ x: 5 }} className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-pink-600/20' : 'bg-pink-100'}`}>
                <Download className={`w-5 h-5 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
              </div>
              <div>
                <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Downloadable Resources
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  PDFs, worksheets & more
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-xl text-center ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}
            >
              <div className="flex items-center justify-center mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {course.rating}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Rating
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-xl text-center ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}
            >
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {course.purchased > 999 ? `${Math.floor(course.purchased / 1000)}K` : course.purchased}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Students
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CourseActionPanel;