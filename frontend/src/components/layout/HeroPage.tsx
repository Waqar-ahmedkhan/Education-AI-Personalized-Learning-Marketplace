"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, Brain, Target, Trophy, Users, Play } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen pt-12 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 overflow-hidden">
      {/* Enhanced Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Multiple floating orbs with improved animations */}
        <motion.div 
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-cyan-400/20 dark:from-blue-500/20 dark:to-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute bottom-32 right-32 w-48 h-48 bg-gradient-to-br from-purple-400/25 to-pink-400/20 dark:from-purple-500/15 dark:to-pink-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-cyan-400/30 to-emerald-400/20 dark:from-cyan-500/20 dark:to-emerald-500/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.6, 0.2],
            x: [0, 20, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div 
          className="absolute top-1/4 right-1/4 w-20 h-20 bg-gradient-to-br from-indigo-400/25 to-purple-400/20 dark:from-indigo-500/15 dark:to-purple-500/10 rounded-full blur-2xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, -25, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
        
        {/* Enhanced grid pattern */}
        <div className="absolute inset-0 bg-grid-slate-200/40 dark:bg-grid-slate-700/20 bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,white_70%,transparent_100%)]" />
        
        {/* Additional mesh gradient overlay */}
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
              {/* Premium Badge with enhanced styling */}
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
                  Personalized learning paths powered by AI for Pakistan&apos;s competitive exams
                </motion.h2>
              </motion.div>

              {/* Enhanced Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed"
              >
                Transform your exam preparation with adaptive AI that creates personalized study plans, 
                intelligent practice tests, and real-time performance insights.
              </motion.p>

              {/* Enhanced Key Features Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {[
                  { icon: Brain, label: "AI-Powered", desc: "Smart Learning", color: "from-blue-500 to-cyan-500" },
                  { icon: Target, label: "Personalized", desc: "Study Plans", color: "from-purple-500 to-pink-500" },
                  { icon: Trophy, label: "98% Success", desc: "Rate Achieved", color: "from-emerald-500 to-teal-500" }
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
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
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
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="relative border-2 border-blue-300/60 dark:border-blue-600/60 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 px-8 py-6 text-lg font-semibold rounded-2xl transition-all duration-500 backdrop-blur-sm shadow-lg hover:shadow-xl w-full sm:w-auto overflow-hidden"
                    asChild
                  >
                    <a href="/demo" className="flex items-center justify-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <motion.div
                          className="absolute inset-0 bg-blue-500/20 rounded-full"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <div className="relative bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full p-2 shadow-lg">
                          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                      <span>Watch Demo</span>
                    </a>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Enhanced Social Proof */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="pt-8 border-t border-slate-200/60 dark:border-slate-700/60"
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="relative">
                    <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
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
                {/* Enhanced Background glow effect */}
                <motion.div 
                  className="absolute -inset-8 bg-gradient-to-r from-blue-500/25 via-purple-500/25 to-indigo-500/25 dark:from-blue-500/35 dark:via-purple-500/35 dark:to-indigo-500/35 rounded-[2rem] blur-3xl opacity-60"
                  animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.4, 0.7, 0.4],
                    rotate: [0, 1, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Enhanced Image container with glassmorphism */}
                <motion.div 
                  className="relative bg-white/40 dark:bg-slate-800/40 rounded-3xl p-6 lg:p-8 backdrop-blur-2xl border border-white/30 dark:border-slate-700/60 shadow-2xl hover:shadow-3xl transition-all duration-700"
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    >
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

                {/* Enhanced decorative elements */}
                <motion.div 
                  className="absolute -z-10 top-8 right-8 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/10 dark:from-blue-500/30 dark:to-cyan-500/20 rounded-full blur-3xl"
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
                  className="absolute -z-10 bottom-8 left-8 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/10 dark:from-purple-500/30 dark:to-pink-500/20 rounded-full blur-3xl"
                  animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.4, 0.7, 0.4],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}