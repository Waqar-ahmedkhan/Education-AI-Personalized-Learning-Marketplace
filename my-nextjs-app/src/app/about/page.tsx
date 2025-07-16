"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Target, 
  Globe, 
  Lightbulb, 
  Star, 
  Award, 
  ChevronRight,
  Sparkles,
  TrendingUp,
  Shield,
  Heart,
  Rocket,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AboutSection() {
  const { resolvedTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [showFounderTable, setShowFounderTable] = useState(false);
  const isDark = resolvedTheme === 'dark';

  // Memoized data
  const features = useMemo(() => [
    {
      icon: <GraduationCap className="w-10 h-10" />,
      title: "Competitive Exam Prep",
      description: "Comprehensive preparation for all major competitive examinations with AI-driven practice tests",
      color: "from-blue-500 to-cyan-500",
      illustration: <Rocket className="w-12 h-12 opacity-20 absolute -top-4 -right-4" />
    },
    {
      icon: <BookOpen className="w-10 h-10" />,
      title: "School Excellence",
      description: "Foundation to advanced courses for academic success with interactive learning modules",
      color: "from-purple-500 to-pink-500",
      illustration: <Palette className="w-12 h-12 opacity-20 absolute -top-4 -right-4" />
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Professional Skills",
      description: "Cutting-edge IT courses and career-advancing programs with real-world projects",
      color: "from-green-500 to-emerald-500",
      illustration: <Target className="w-12 h-12 opacity-20 absolute -top-4 -right-4" />
    },
    {
      icon: <Target className="w-10 h-10" />,
      title: "Personalized Learning",
      description: "AI-powered interactive tools with customized learning paths for optimal growth",
      color: "from-orange-500 to-red-500",
      illustration: <Lightbulb className="w-12 h-12 opacity-20 absolute -top-4 -right-4" />
    }
  ], []);

  const stats = useMemo(() => [
    { number: "50K+", label: "Students Enrolled", icon: <Users className="w-8 h-8" /> },
    { number: "500+", label: "Expert Instructors", icon: <Award className="w-8 h-8" /> },
    { number: "1000+", label: "Courses Available", icon: <BookOpen className="w-8 h-8" /> },
    { number: "95%", label: "Success Rate", icon: <TrendingUp className="w-8 h-8" /> }
  ], []);

  const values = useMemo(() => [
    {
      icon: <Shield className="w-10 h-10" />,
      title: "Quality Assurance",
      description: "Rigorously tested content by industry experts for unparalleled accuracy"
    },
    {
      icon: <Heart className="w-10 h-10" />,
      title: "Student-Centric",
      description: "Every decision prioritizes student success and engagement"
    },
    {
      icon: <Sparkles className="w-10 h-10" />,
      title: "Innovation First",
      description: "Cutting-edge technology meets educational excellence"
    }
  ], []);

  const founderDetails = useMemo(() => [
    { label: "Name", value: "Waqar Ahmed" },
    { label: "Role", value: "Founder & CEO" },
    { label: "Vision", value: "Building a future where learning knows no boundaries" },
    { label: "Experience", value: "15+ years in EdTech innovation" }
  ], []);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

  const handleFeatureHover = useCallback((index: number) => {
    setActiveFeature(index);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const tableVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.5, ease: "easeInOut" } }
  };

  return (
    <section className={`min-h-screen py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6 font-semibold transition-all duration-300 ${
            isDark 
              ? 'bg-blue-900/30 text-blue-300 backdrop-blur-md border border-blue-700/20 hover:bg-blue-900/50' 
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          }`}>
            <Lightbulb className="w-6 h-6 animate-pulse" />
            Transforming Education Through Innovation
          </div>
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight ${
            isDark
              ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent'
          }`}>
            About EduAI
          </h1>
          <p className={`text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Empowering learners worldwide with AI-driven, accessible education solutions
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 mb-16">
          {/* Left Side - Mission & Story */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            transition={{ delay: 0.2 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className={`rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
              isDark
                ? 'bg-gray-800/40 backdrop-blur-md border border-gray-700/20 hover:bg-gray-800/60'
                : 'bg-white border border-gray-100 hover:shadow-2xl'
            }`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-700' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}>
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h2 className={`text-2xl sm:text-3xl font-bold ${
                  isDark ? 'text-gray-100' : 'text-gray-800'
                }`}>Our Mission</h2>
              </div>
              <p className={`text-sm sm:text-base leading-relaxed mb-4 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                At EduAI, we are revolutionizing education by delivering an innovative e-learning platform tailored for diverse learners. Our goal is to make quality education universally accessible.
              </p>
              <p className={`text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                We empower learners with AI-driven tools and expertly crafted content, supporting academic excellence, competitive exam success, and career advancement.
              </p>
            </div>

            <div className={`rounded-3xl p-6 sm:p-8 text-white transition-all duration-300 ${
              isDark
                ? 'bg-gradient-to-r from-blue-800 to-purple-800 hover:from-blue-700 hover:to-purple-700'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
            }`}>
              <div className="flex items-center gap-4 mb-6">
                <Star className="w-10 h-10" />
                <h3 className="text-xl sm:text-2xl font-bold">What Sets Us Apart</h3>
              </div>
              <p className="text-sm sm:text-base leading-relaxed">
                EduAI uniquely addresses the needs of learners globally, with a focus on Pakistan. Our platform combines cutting-edge AI with comprehensive content to unlock every learner&aposs potential.
              </p>
            </div>

            {/* Values Section */}
            <div className={`rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
              isDark
                ? 'bg-gray-800/40 backdrop-blur-md border border-gray-700/20'
                : 'bg-white shadow-xl border border-gray-100'
            }`}>
              <h3 className={`text-xl sm:text-2xl font-bold mb-6 ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}>Our Core Values</h3>
              <div className="space-y-4">
                {values.map((value, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-colors duration-300 ${
                      isDark 
                        ? 'hover:bg-gray-700/30' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${
                      isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {value.icon}
                    </div>
                    <div>
                      <h4 className={`font-semibold text-base sm:text-lg ${
                        isDark ? 'text-gray-200' : 'text-gray-800'
                      }`}>{value.title}</h4>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>{value.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Features */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            transition={{ delay: 0.4 }}
          >
            <div className={`rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
              isDark
                ? 'bg-gray-800/40 backdrop-blur-md border border-gray-700/20'
                : 'bg-white border border-gray-100'
            }`}>
              <h3 className={`text-xl sm:text-2xl font-bold mb-8 text-center ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}>Comprehensive Learning Solutions</h3>
              <div className="space-y-4">
                <AnimatePresence>
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className={`relative p-5 sm:p-6 rounded-2xl border-2 transition-all duration-500 cursor-pointer overflow-hidden ${
                        activeFeature === index
                          ? isDark
                            ? 'border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-500/20 scale-105'
                            : 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                          : isDark
                            ? 'border-gray-600 hover:border-blue-400 hover:bg-gray-700/30'
                            : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                      onMouseEnter={() => handleFeatureHover(index)}
                    >
                      {feature.illustration}
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl transition-all duration-300 ${
                          activeFeature === index 
                            ? `bg-gradient-to-r ${feature.color} text-white shadow-lg`
                            : isDark
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-base sm:text-lg mb-1 ${
                            isDark ? 'text-gray-200' : 'text-gray-800'
                          }`}>{feature.title}</h4>
                          <p className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>{feature.description}</p>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-all duration-300 ${
                          activeFeature === index 
                            ? 'text-blue-500 translate-x-2 scale-110' 
                            : isDark ? 'text-gray-400' : 'text-gray-400'
                        }`} />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <div className={`rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
            isDark
              ? 'bg-gray-800/40 backdrop-blur-md border border-gray-700/20'
              : 'bg-white border border-gray-100'
          }`}>
            <h3 className={`text-2xl sm:text-3xl font-bold text-center mb-12 ${
              isDark ? 'text-gray-100' : 'text-gray-800'
            }`}>Our Impact in Numbers</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  className="text-center"
                >
                  <div className={`rounded-2xl p-6 mb-4 transition-all duration-300 ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500'
                  } shadow-lg hover:shadow-xl`}>
                    <div className="flex items-center justify-center mb-3">
                      {stat.icon}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white">{stat.number}</div>
                  </div>
                  <div className={`font-medium text-sm sm:text-base ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Founder Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <div className={`rounded-3xl p-6 sm:p-8 md:p-12 transition-all duration-300 relative overflow-hidden ${
            isDark
              ? 'bg-gradient-to-r from-gray-800 to-blue-900 hover:from-gray-700 hover:to-blue-800'
              : 'bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100'
          }`}>
            <Rocket className="w-24 h-24 opacity-10 absolute -top-8 -right-8 rotate-45" />
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl cursor-pointer ${
                  isDark ? 'bg-gray-800 border border-gray-700/50' : 'bg-white border border-gray-200'
                }`}
                onClick={() => setShowFounderTable(!showFounderTable)}
              >
                <Award className={`w-12 h-12 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </motion.div>
              <h3 className={`text-2xl sm:text-3xl font-bold mb-4 ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}>Meet Our Visionary Leader</h3>
              <AnimatePresence>
                {!showFounderTable ? (
                  <motion.div
                    key="founder-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className={`${
                      isDark ? 'bg-gray-800/40 backdrop-blur-md border border-gray-700/20' : 'bg-white border border-gray-200'
                    } rounded-2xl p-6`}
                  >
                    <h4 className={`text-xl sm:text-2xl font-bold mb-2 ${
                      isDark ? 'text-gray-100' : 'text-gray-800'
                    }`}>Waqar Ahmed</h4>
                    <p className={`text-base sm:text-lg mb-4 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                      Founder & CEO of EduAI
                    </p>
                    <p className={`text-sm sm:text-base leading-relaxed ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      `Education is the key to unlocking global potential. At EduAI, we&aposre building a future where learning knows no boundaries, empowering every individual to achieve greatness.`
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="founder-table"
                    variants={tableVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className={`${
                      isDark ? 'bg-gray-800/40 backdrop-blur-md border border-gray-700/20' : 'bg-white border border-gray-200'
                    } rounded-2xl p-6 overflow-hidden`}
                  >
                    <table className="w-full text-left">
                      <tbody>
                        {founderDetails.map((detail, index) => (
                          <motion.tr
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`border-b last:border-b-0 ${
                              isDark ? 'border-gray-700' : 'border-gray-200'
                            }`}
                          >
                            <td className={`py-3 px-4 font-semibold text-sm sm:text-base ${
                              isDark ? 'text-gray-200' : 'text-gray-800'
                            }`}>{detail.label}</td>
                            <td className={`py-3 px-4 text-sm sm:text-base ${
                              isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}>{detail.value}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          transition={{ delay: 1.0 }}
          className="text-center"
        >
          <div className={`rounded-3xl p-8 sm:p-12 text-white transition-all duration-300 ${
            isDark
              ? 'bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-600'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
          } shadow-2xl relative overflow-hidden`}>
            <Sparkles className="w-20 h-20 mx-auto mb-6 animate-pulse opacity-30" />
            <h3 className="text-3xl sm:text-4xl font-bold mb-6">Join the Education Revolution</h3>
            <p className="text-base sm:text-xl mb-8 max-w-3xl mx-auto">
              Redefine your learning journey with EduAI. Join a global community where innovation meets opportunity, and every learner thrives.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:shadow-lg transition-all duration-300 group border-2 border-transparent hover:border-white hover:bg-transparent hover:text-white"
            >
              Start Your Journey Today
              <ChevronRight className="w-5 h-5 inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}