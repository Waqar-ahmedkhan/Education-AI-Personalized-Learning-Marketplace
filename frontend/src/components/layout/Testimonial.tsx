"use client";

import React from "react";
import { Star, Rocket, Award, User, Calendar, TrendingUp, Sparkles, Brain, Trophy, Users, Play, UserPlus, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Hero Section Component
export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-12 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs with Improved Animations */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-cyan-400/20 dark:from-blue-500/20 dark:to-cyan-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="absolute bottom-32 right-32 w-48 h-48 bg-gradient-to-br from-purple-400/25 to-pink-400/20 dark:from-purple-500/15 dark:to-pink-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4], x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: [0.22, 1, 0.36, 1], delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-cyan-400/30 to-emerald-400/20 dark:from-cyan-500/20 dark:to-emerald-500/10 rounded-full blur-2xl"
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.6, 0.2], x: [0, 20, 0], y: [0, -30, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: [0.22, 1, 0.36, 1], delay: 2 }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-20 h-20 bg-gradient-to-br from-indigo-400/25 to-purple-400/20 dark:from-indigo-500/15 dark:to-purple-500/10 rounded-full blur-2xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3], x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: [0.22, 1, 0.36, 1], delay: 3 }}
        />

        {/* Enhanced Grid Pattern */}
        <div className="absolute inset-0 bg-grid-slate-200/40 dark:bg-grid-slate-700/20 bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,white_70%,transparent_100%)]" />

        {/* Mesh Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent dark:via-blue-950/30 opacity-50" />
      </div>

      <div className="relative z-10 flex items-center min-h-screen pt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
            {/* Left Side - Enhanced Content */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Premium Badge with Enhanced Styling */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center gap-2"
              >
                <Badge className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500/15 to-purple-500/15 dark:from-blue-500/25 dark:to-purple-500/25 border-blue-200/60 dark:border-blue-700/60 text-blue-700 dark:text-blue-300 backdrop-blur-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  <span className="font-semibold text-sm">AI-Powered Learning Platform</span>
                </Badge>
              </motion.div>

              {/* Enhanced Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
                  <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
                    Ace CSS & PMS
                  </span>
                  <span className="block text-slate-800 dark:text-slate-100 mt-2">
                    with{" "}
                    <span className="relative">
                      Smart AI
                      <motion.div
                        className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
                      />
                    </span>
                  </span>
                </h1>
                <motion.h2
                  className="text-lg sm:text-xl lg:text-2xl font-medium text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                >
                  Personalized learning paths for all, powered by AI for Pakistan&apos;s competitive exams
                </motion.h2>
              </motion.div>

              {/* Enhanced Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed"
              >
                Transform your exam preparation with adaptive AI that creates personalized study plans, intelligent practice tests, and real-time performance insights for every aspirant.
              </motion.p>

              {/* Enhanced Key Features Cards with Gender-Inclusive Icons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {[
                  { icon: Brain, label: "AI-Powered", desc: "Smart Learning", color: "from-blue-500 to-cyan-500" },
                  { icon: UserPlus, label: "Inclusive", desc: "For All Aspirants", color: "from-purple-500 to-pink-500" },
                  { icon: Trophy, label: "98% Success", desc: "Rate Achieved", color: "from-emerald-500 to-teal-500" },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group"
                  >
                    <Card className="bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-500 shadow-lg hover:shadow-xl rounded-2xl overflow-hidden">
                      <CardContent className="p-6 text-center relative">
                        <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${feature.color} p-3 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{feature.label}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{feature.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Enhanced CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row gap-4 pt-6"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative group">
                  <Button
                    size="lg"
                    className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform overflow-hidden w-full sm:w-auto"
                    asChild
                  >
                    <a href="/signup" className="flex items-center justify-center gap-3">
                      <span>Start Your AI Journey</span>
                      <motion.span
                        className="inline-block"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        →
                      </motion.span>
                    </a>
                  </Button>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl" />
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative group">
                  <Button
                    variant="outline"
                    size="lg"
                    className="relative border-2 border-blue-300/60 dark:border-blue-600/60 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 px-8 py-6 text-lg font-semibold rounded-2xl transition-all duration-500 backdrop-blur-sm shadow-lg hover:shadow-xl w-full sm:w-auto overflow-hidden"
                    asChild
                  >
                    <a href="/demo" className="flex items-center justify-center gap-3">
                      <div className="relative flex items-center justify-center w-8 h-8">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <Play className="w-4 h-4 text-white fill-white relative z-10" />
                      </div>
                      <span>Watch Demo</span>
                    </a>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Enhanced Social Proof with Gender-Inclusive Icons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="pt-8 border-t border-slate-200/60 dark:border-slate-700/60"
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="relative flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center">
                    Trusted by <span className="text-slate-800 dark:text-slate-200 font-semibold">10,000+</span> successful candidates
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Enhanced Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative lg:order-last"
            >
              <div className="relative">
                {/* Enhanced Background Glow Effect */}
                <motion.div
                  className="absolute -inset-8 bg-gradient-to-r from-blue-500/25 via-purple-500/25 to-indigo-500/25 dark:from-blue-500/35 dark:via-purple-500/35 dark:to-indigo-500/35 rounded-[2rem] blur-3xl opacity-60"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4], rotate: [0, 1, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Enhanced Image Container with Glassmorphism */}
                <motion.div
                  className="relative bg-white/40 dark:bg-slate-800/40 rounded-3xl p-6 lg:p-8 backdrop-blur-2xl border border-white/30 dark:border-slate-700/60 shadow-2xl hover:shadow-3xl transition-all duration-700"
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                    <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.7, ease: "easeOut" }}>
                      <Image
                        src="/hero-page.png"
                        alt="Student using AI-powered learning platform for CSS and PMS exam preparation"
                        width={700}
                        height={500}
                        className="w-full h-auto object-cover"
                        priority
                      />
                    </motion.div>

                    {/* Enhanced Floating Statistics */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0, y: -30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 1, delay: 1.2, type: "spring", bounce: 0.4 }}
                      className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-xl backdrop-blur-sm border border-white/20 hover:scale-105 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <motion.span
                          className="w-2 h-2 bg-white rounded-full"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        98% Success Rate
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 1, delay: 1.4, type: "spring", bounce: 0.4 }}
                      className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-xl backdrop-blur-sm border border-white/20 hover:scale-105 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        10,000+ Students
                      </div>
                    </motion.div>

                    {/* Enhanced AI Learning Indicator */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 1, delay: 1.6, type: "spring", bounce: 0.4 }}
                      className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-2xl text-xs font-bold shadow-xl backdrop-blur-sm border border-white/20 hover:scale-105 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Brain className="w-3 h-3" />
                        </motion.div>
                        AI Active
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Enhanced Decorative Elements */}
                <motion.div
                  className="absolute -z-10 top-8 right-8 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/10 dark:from-blue-500/30 dark:to-cyan-500/20 rounded-full blur-3xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute -z-10 bottom-8 left-8 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/10 dark:from-purple-500/30 dark:to-pink-500/20 rounded-full blur-3xl"
                  animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Star Rating Component
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
              className={`${starValue <= rating ? "fill-amber-400 text-amber-400 dark:fill-amber-300 dark:text-amber-300" : "text-slate-300 dark:text-slate-600"}`}
            />
            {rating % 1 > 0 && starValue === Math.ceil(rating) && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${(rating % 1) * 100}%` }}>
                <Star size={size} className="fill-amber-400 text-amber-400 dark:fill-amber-300 dark:text-amber-300" />
              </div>
            )}
          </div>
        );
      })}
      <span className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400">{rating.toFixed(1)}</span>
    </div>
  );
};

// Testimonial Card Component
type Testimonial = {
  id: number;
  name: string;
  rating: number;
  content: string;
  highlight?: string;
  since: string;
  avatar: string | null;
  achievement?: string;
  gender?: "male" | "female";
};

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: testimonial.id * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group"
    >
      <Card className="h-full bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl transition-all duration-500 hover:bg-white/70 dark:hover:bg-slate-800/70 hover:border-blue-500/50 dark:hover:border-blue-400/50 shadow-lg hover:shadow-2xl rounded-2xl">
        <CardContent className="p-6 flex flex-col h-full gap-4">
          <div className="flex justify-between items-center">
            <StarRating rating={testimonial.rating} />
            <Badge
              variant="default"
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-600/30 dark:to-emerald-600/30 text-green-800 dark:text-green-200 border-green-500/30 dark:border-green-600/30"
            >
              <Award size={12} className="mr-1" />
              Verified
            </Badge>
          </div>

          <blockquote className="text-slate-600 dark:text-slate-400 leading-relaxed flex-grow text-sm sm:text-base">
            `{testimonial.content}
            {testimonial.highlight && (
              <span className="text-blue-600 dark:text-blue-400 font-medium"> {testimonial.highlight}</span>
            )}`
          </blockquote>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-400/20 dark:to-purple-400/20 flex items-center justify-center shadow-md">
              {testimonial.gender === "male" ? (
                <UserPlus size={20} className="text-blue-600 dark:text-blue-400" />
              ) : testimonial.gender === "female" ? (
                <UserCheck size={20} className="text-purple-600 dark:text-purple-400" />
              ) : (
                <User size={20} className="text-slate-600 dark:text-slate-400" />
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
            <div className="mt-2 p-2 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg border border-blue-500/20 dark:border-blue-400/20">
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

// Testimonials Section Component
const TestimonialsSection = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Darsh Kumar",
      rating: 5.0,
      content: "SuperKalam has been a consistent part of my Mains preparation, especially after clearing my Prelims. The experience of using the Mains evaluation has been",
      highlight: "amazing.",
      since: "Feb'24",
      avatar: null,
      achievement: "Cleared Prelims 2024",
      gender: "male",
    },
    {
      id: 2,
      name: "Joel",
      rating: 5.0,
      content: "SuperKalam is the perfect example of using AI to solve problems in society. Using limited resources to generate maximum output,",
      highlight: "modernizing UPSC preparation.",
      since: "Aug'23",
      avatar: null,
      achievement: "Mock Test Score: 95%",
      gender: "male",
    },
    {
      id: 3,
      name: "Muskan Priya",
      rating: 4.8,
      content: "DPQ+PYQ+DNA are symbols of consistency and discipline for me. MCQs are the best feature because they demand",
      highlight: "conceptual clarity.",
      since: "Nov'23",
      avatar: null,
      achievement: "Daily Practice Streak: 180 days",
      gender: "female",
    },
    {
      id: 4,
      name: "Akansha Anand",
      rating: 5.0,
      content: "Mind maps are precise, effective, and time-saving. SuperKalam is an amazing AI for UPSC preparation, like",
      highlight: "a personal mentor.",
      since: "Feb'24",
      avatar: null,
      achievement: "Improved Score by 45%",
      gender: "female",
    },
    {
      id: 5,
      name: "Anonymous Aspirant",
      rating: 5.0,
      content: "AI tech support in study is another level of enjoyment. Model Papers and Test Series performance analysis",
      highlight: "help a lot.",
      since: "Jan'24",
      avatar: null,
      achievement: "Completed 50+ Mock Tests",
      gender: "male",
    },
    {
      id: 6,
      name: "Dedicated Student",
      rating: 4.5,
      content: "The progress report feedback is really valuable and helps me cover my weak areas effectively.",
      highlight: "",
      since: "Mar'24",
      avatar: null,
      achievement: "Weak Areas Reduced by 60%",
      gender: "female",
    },
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
          <Badge
            variant="outline"
            className="mb-6 bg-blue-500/10 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400 border-blue-500/30 dark:border-blue-400/30 rounded-full px-5 py-2"
          >
            <Rocket className="mr-2 h-4 w-4" />
            Student Success Stories
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            What Students Say About{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              SUPER Plan
            </span>
          </h2>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            Discover how SuperKalam empowers all aspirants with AI-driven, personalized UPSC preparation.
          </p>

          <div className="inline-flex items-center gap-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-lg p-4 shadow-lg">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">{averageRating.toFixed(1)}</div>
              <StarRating rating={averageRating} size={16} />
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
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
          <Card className="inline-block bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                Join Thousands of Successful UPSC Aspirants
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Start your journey with SuperKalam&apos;s AI-powered UPSC preparation platform, designed for everyone.
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative group">
                <Button
                  size="lg"
                  className="px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500"
                >
                  Start Your SUPER Plan
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;