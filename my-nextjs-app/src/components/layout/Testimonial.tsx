"use client";
import React from 'react';
import { Star, Rocket, Award, User, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

type StarRatingProps = {
  rating: number;
  maxRating?: number;
  size?: number;
};

const StarRating = ({ rating, maxRating = 5, size = 18 }: StarRatingProps) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, i) => {
        const starValue = i + 1;
        return (
          <div key={i} className="relative">
            <Star
              size={size}
              className={`${starValue <= rating ? 'fill-amber-400 text-amber-400 dark:fill-amber-300 dark:text-amber-300' : 'text-slate-300 dark:text-slate-600'}`}
            />
            {rating % 1 > 0 && starValue === Math.ceil(rating) && (
              <div 
                className="absolute inset-0 overflow-hidden" 
                style={{ width: `${(rating % 1) * 100}%` }}
              >
                <Star
                  size={size}
                  className="fill-amber-400 text-amber-400 dark:fill-amber-300 dark:text-amber-300"
                />
              </div>
            )}
          </div>
        );
      })}
      <span className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

type Testimonial = {
  id: number;
  name: string;
  rating: number;
  content: string;
  highlight?: string;
  since: string;
  avatar: string | null;
  achievement?: string;
};

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: testimonial.id * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 dark:hover:border-blue-400/50">
        <CardContent className="p-6 flex flex-col h-full gap-4">
          <div className="flex justify-between items-center">
            <StarRating rating={testimonial.rating} />
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Award size={12} className="mr-1" />
              Verified
            </Badge>
          </div>
          
          <blockquote className="text-slate-600 dark:text-slate-400 leading-relaxed flex-grow">
            &quot;{testimonial.content}&quot;
            {testimonial.highlight && (
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {testimonial.highlight}
              </span>
            )}
          </blockquote>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/5 dark:from-blue-400/20 dark:to-blue-400/5 flex items-center justify-center">
              {testimonial.avatar ? (
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                  width={40}
                  height={40}
                  loading="lazy"
                />
              ) : (
                <User size={18} className="text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-100">{testimonial.name}</div>
              <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                <Calendar size={12} />
                Since {testimonial.since}
              </div>
            </div>
          </div>
          
          {testimonial.achievement && (
            <div className="mt-2 p-2 bg-blue-500/5 dark:bg-blue-400/10 rounded-lg border border-blue-500/10 dark:border-blue-400/10">
              <div className="flex items-center gap-2 text-xs">
                <TrendingUp size={14} className="text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-600 dark:text-blue-400">Achievement:</span>
                <span>{testimonial.achievement}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Darsh Kumar",
      rating: 5.0,
      content: "SuperKalam has been a consistent part of my Mains preparation, especially after clearing my Prelims. The experience of using the Mains evaluation has been",
      highlight: "amazing.",
      since: "Feb'24",
      avatar: "/api/placeholder/48/48",
      achievement: "Cleared Prelims 2024"
    },
    {
      id: 2,
      name: "Joel",
      rating: 5.0,
      content: "SuperKalam is the perfect example of using AI to solve problems in society. Using limited resources to generate maximum output.",
      highlight: "modernizing UPSC preparation.",
      since: "Aug'23",
      avatar: "/api/placeholder/48/48",
      achievement: "Mock Test Score: 95%"
    },
    {
      id: 3,
      name: "Muskan Priya",
      rating: 4.8,
      content: "DPQ+PYQ+DNA are symbols of consistency and discipline for me. MCQs are the best feature because they demand conceptual clarity.",
      highlight: "",
      since: "Nov'23",
      avatar: "/api/placeholder/48/48",
      achievement: "Daily Practice Streak: 180 days"
    },
    {
      id: 4,
      name: "Akansha Anand",
      rating: 5.0,
      content: "Mind maps are precise, effective, and time-saving. SuperKalam is an amazing AI for UPSC preparation, like a personal mentor.",
      highlight: "",
      since: "Feb'24",
      avatar: "/api/placeholder/48/48",
      achievement: "Improved Score by 45%"
    },
    {
      id: 5,
      name: "Anonymous Aspirant",
      rating: 5.0,
      content: "AI tech support in study is another level of enjoyment. Model Papers and Test Series performance analysis help a lot.",
      highlight: "",
      since: "Jan'24",
      avatar: null,
      achievement: "Completed 50+ Mock Tests"
    },
    {
      id: 6,
      name: "Dedicated Student",
      rating: 4.5,
      content: "The progress report feedback is really valuable and helps me cover my weak areas effectively.",
      highlight: "",
      since: "Mar'24",
      avatar: null,
      achievement: "Weak Areas Reduced by 60%"
    }
  ];

  const averageRating = testimonials.reduce((acc, curr) => acc + curr.rating, 0) / testimonials.length;

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge variant="outline" className="mb-6 bg-blue-500/10 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400">
            <Rocket className="mr-2 h-4 w-4" />
            Student Testimonials
          </Badge>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            What Students Say About{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              SUPER Plan
            </span>
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            Discover how SuperKalam transforms UPSC preparation with AI-powered tools and personalized learning.
          </p>
          
          <div className="inline-flex items-center gap-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">{averageRating.toFixed(1)}</div>
              <StarRating rating={averageRating} size={16} />
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="text-center">
              <div className="text-sm text-slate-600 dark:text-slate-400">Based on</div>
              <div className="font-semibold text-slate-800 dark:text-slate-100">{testimonials.length}+ reviews</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 sm:mb-16">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <Card className="inline-block bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                Join Thousands of Successful UPSC Aspirants
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Start your journey with SuperKalam&#39;s AI-powered UPSC preparation platform.
              </p>
              <Button
                size="lg"
                className="px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600"
              >
                Start Your SUPER Plan
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;