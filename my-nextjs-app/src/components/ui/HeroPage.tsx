"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, Brain, Target, Trophy, Users } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen pt-12 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 overflow-hidden">
      {/* Enhanced Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary floating orbs */}
        <motion.div 
          className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute bottom-32 right-32 w-48 h-48 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/25 bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,white_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 flex items-center min-h-screen pt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Left Side - Enhanced Content */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Premium Badge with Icon */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center gap-2"
              >
                <Badge className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold">AI-Powered Learning Platform</span>
                </Badge>
              </motion.div>

              {/* Main Heading with Typography Hierarchy */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="space-y-4"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Ace CSS & PMS
                  </span>
                  <span className="block text-slate-800 dark:text-slate-100 mt-2">
                    with Smart AI
                  </span>
                </h1>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-medium text-slate-600 dark:text-slate-400 max-w-xl">
                  Personalized learning paths powered by AI for Pakistan&#39;s competitive exams
                </h2>
              </motion.div>

              {/* Enhanced Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed"
              >
                Transform your exam preparation with adaptive AI that creates personalized study plans, 
                intelligent practice tests, and real-time performance insights.
              </motion.p>

              {/* Key Features Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {[
                  { icon: Brain, label: "AI-Powered", desc: "Smart Learning" },
                  { icon: Target, label: "Personalized", desc: "Study Plans" },
                  { icon: Trophy, label: "98% Success", desc: "Rate Achieved" }
                ].map((feature, index) => (
                  <Card key={index} className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300">
                    <CardContent className="p-4 text-center">
                      <feature.icon className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{feature.label}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{feature.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>

              {/* Enhanced CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
                  asChild
                >
                  <a href="/signup" className="flex items-center gap-2">
                    <span>Start Your AI Journey</span>
                    <motion.span
                      className="inline-block"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 px-8 py-6 text-lg font-semibold rounded-2xl transition-all duration-300 group"
                  asChild
                >
                  <a href="/demo" className="flex items-center gap-2">
                    <span>Watch Demo</span>
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </a>
                </Button>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="pt-8 border-t border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Trusted by 10,000+ successful candidates</p>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
                    <Image
                      src="/api/placeholder/120/40"
                      alt="Y Combinator"
                      width={120}
                      height={40}
                      className="h-8 w-auto filter dark:invert"
                    />
                  </div>
                  <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
                    <Image
                      src="/api/placeholder/140/40"
                      alt="Google for Startups"
                      width={140}
                      height={40}
                      className="h-8 w-auto filter dark:invert"
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Enhanced Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative lg:order-last"
            >
              <div className="relative">
                {/* Enhanced Background glow effect */}
                <motion.div 
                  className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 dark:from-blue-500/30 dark:via-purple-500/30 dark:to-indigo-500/30 rounded-3xl blur-3xl opacity-60"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.4, 0.6, 0.4],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Image container with glassmorphism */}
                <div className="relative bg-white/30 dark:bg-slate-800/30 rounded-3xl p-6 lg:p-8 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 shadow-2xl">
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-slate-900">
                    <Image
                      src="/hero-page.png"
                      alt="Student using AI-powered learning platform for CSS and PMS exam preparation"
                      width={700}
                      height={500}
                      className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                      priority
                    />
                    
                    {/* Enhanced Floating Statistics */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1.2, type: "spring" }}
                      className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        98% Success Rate
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1.4, type: "spring" }}
                      className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        10,000+ Students
                      </div>
                    </motion.div>

                    {/* AI Learning Indicator */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 1.6, type: "spring" }}
                      className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="w-3 h-3" />
                        AI Active
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -z-10 top-8 right-8 w-24 h-24 bg-blue-400/10 dark:bg-blue-500/20 rounded-full blur-2xl"></div>
                <div className="absolute -z-10 bottom-8 left-8 w-32 h-32 bg-purple-400/10 dark:bg-purple-500/20 rounded-full blur-2xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}