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
  Heart
} from 'lucide-react';

export default function AboutSection() {
  const { resolvedTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const isDark = resolvedTheme === 'dark';

  // Memoized data to prevent unnecessary re-renders
  const features = useMemo(() => [
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Competitive Exam Prep",
      description: "Comprehensive preparation for all major competitive examinations",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "School Excellence", 
      description: "Foundation to advanced courses for academic success",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Professional Skills",
      description: "IT courses and career-advancing programs",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Personalized Learning",
      description: "Interactive tools with customized learning paths",
      color: "from-orange-500 to-red-500"
    }
  ], []);

  const stats = useMemo(() => [
    { number: "50K+", label: "Students Enrolled", icon: <Users className="w-6 h-6" /> },
    { number: "500+", label: "Expert Instructors", icon: <Award className="w-6 h-6" /> },
    { number: "1000+", label: "Courses Available", icon: <BookOpen className="w-6 h-6" /> },
    { number: "95%", label: "Success Rate", icon: <TrendingUp className="w-6 h-6" /> }
  ], []);

  const values = useMemo(() => [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Quality Assurance",
      description: "Rigorously tested content by industry experts"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Student-Centric",
      description: "Every decision is made with student success in mind"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Innovation First",
      description: "Cutting-edge technology meets educational excellence"
    }
  ], []);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);


 

  const handleFeatureHover = useCallback((index: number) => {
    setActiveFeature(index);
  }, []);

  return (
    <section className={`min-h-screen transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    } py-20 px-4 overflow-hidden`}>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className={`text-center mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full mb-6 font-semibold transition-colors duration-300 ${
            isDark 
              ? 'bg-blue-900/50 text-blue-300 backdrop-blur-sm border border-blue-700/30' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            <Lightbulb className="w-5 h-5" />
            Transforming Education Through Innovation
          </div>
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 transition-colors duration-300 ${
            isDark
              ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent'
          }`}>
            About EduAI
          </h1>
          <p className={`text-xl max-w-3xl mx-auto leading-relaxed transition-colors duration-300 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Empowering learners worldwide with cutting-edge technology and expertly crafted content
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Side - Mission & Story */}
          <div className={`space-y-8 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            <div className={`rounded-3xl p-8 shadow-xl transition-all duration-300 ${
              isDark
                ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 hover:bg-gray-800/70'
                : 'bg-white border border-gray-100 hover:shadow-2xl'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-700' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}>
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-3xl font-bold transition-colors duration-300 ${
                  isDark ? 'text-gray-100' : 'text-gray-800'
                }`}>Our Mission</h2>
              </div>
              <p className={`leading-relaxed mb-6 transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                At EduAI, we are dedicated to transforming education by providing an innovative e-learning platform designed for a diverse range of learners. We aim to make quality education accessible to everyone, anywhere, anytime.
              </p>
              <p className={`leading-relaxed transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Our mission is to empower learners with a platform that combines advanced technology and carefully crafted content, helping you achieve your goals whether it&apos;s excelling in academics, passing crucial exams, or advancing in your career.
              </p>
            </div>

            <div className={`rounded-3xl p-8 text-white transition-all duration-300 ${
              isDark
                ? 'bg-gradient-to-r from-blue-800 to-purple-800 hover:from-blue-700 hover:to-purple-700'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-8 h-8" />
                <h3 className="text-2xl font-bold">What Sets Us Apart</h3>
              </div>
              <p className="leading-relaxed">
                EduAI stands apart by addressing the unique needs of learners in Pakistan and beyond. We believe education is the key to unlocking potential, and our platform ensures you have the resources and support needed to succeed.
              </p>
            </div>

            {/* Values Section */}
            <div className={`rounded-3xl p-8 transition-all duration-300 ${
              isDark
                ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/30'
                : 'bg-white shadow-xl border border-gray-100'
            }`}>
              <h3 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}>Our Core Values</h3>
              <div className="space-y-4">
                {values.map((value, index) => (
                  <div key={index} className={`flex items-center gap-4 p-4 rounded-xl transition-colors duration-300 ${
                    isDark 
                      ? 'hover:bg-gray-700/30' 
                      : 'hover:bg-gray-50'
                  }`}>
                    <div className={`p-2 rounded-lg ${
                      isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {value.icon}
                    </div>
                    <div>
                      <h4 className={`font-semibold transition-colors duration-300 ${
                        isDark ? 'text-gray-200' : 'text-gray-800'
                      }`}>{value.title}</h4>
                      <p className={`text-sm transition-colors duration-300 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <div className={`rounded-3xl p-8 shadow-xl transition-all duration-300 ${
              isDark
                ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/30'
                : 'bg-white border border-gray-100'
            }`}>
              <h3 className={`text-2xl font-bold mb-8 text-center transition-colors duration-300 ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}>Comprehensive Learning Solutions</h3>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl border-2 transition-all duration-500 cursor-pointer ${
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
                        <h4 className={`font-semibold mb-1 transition-colors duration-300 ${
                          isDark ? 'text-gray-200' : 'text-gray-800'
                        }`}>{feature.title}</h4>
                        <p className={`text-sm transition-colors duration-300 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>{feature.description}</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-all duration-300 ${
                        activeFeature === index 
                          ? 'text-blue-500 translate-x-1 scale-110' 
                          : isDark ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className={`mb-20 transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className={`rounded-3xl p-8 shadow-xl transition-all duration-300 ${
            isDark
              ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/30'
              : 'bg-white border border-gray-100'
          }`}>
            <h3 className={`text-3xl font-bold text-center mb-12 transition-colors duration-300 ${
              isDark ? 'text-gray-100' : 'text-gray-800'
            }`}>Our Impact in Numbers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className={`rounded-2xl p-6 mb-4 group-hover:scale-110 transition-all duration-300 ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500'
                  } shadow-lg group-hover:shadow-xl`}>
                    <div className="flex items-center justify-center mb-2">
                      {stat.icon}
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-white">{stat.number}</div>
                  </div>
                  <div className={`font-medium transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Founder Section */}
        <div className={`mb-20 transition-all duration-1000 delay-900 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className={`rounded-3xl p-8 md:p-12 text-white transition-all duration-300 ${
            isDark
              ? 'bg-gradient-to-r from-gray-800 to-blue-800 hover:from-gray-700 hover:to-blue-700'
              : 'bg-gradient-to-r from-gray-900 to-blue-900 hover:from-gray-800 hover:to-blue-800'
          }`}>
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Award className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Meet Our Visionary Leader</h3>
              <div className="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-sm">
                <h4 className="text-2xl font-bold mb-2">Founder-Name</h4>
                <p className="text-blue-200 text-lg mb-4">Founder & CEO of EduAI</p>
                <p className="text-gray-200 leading-relaxed">
                  &quot;Education is the most powerful weapon which you can use to change the world. At EduAI, we&apos;re not just creating an e-learning platform – we&apos;re building bridges to knowledge, opportunity, and success for learners everywhere.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className={`text-center transition-all duration-1000 delay-1100 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className={`rounded-3xl p-12 text-white transition-all duration-300 ${
            isDark
              ? 'bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-600 hover:to-purple-600'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
          } shadow-2xl`}>
            <Sparkles className="w-16 h-16 mx-auto mb-6 animate-pulse" />
            <h3 className="text-4xl font-bold mb-6">Join the Education Revolution</h3>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Together, let&apos;s redefine education for a smarter, more connected world. Join us in shaping a future where learning is not limited by boundaries and everyone has the opportunity to thrive.
            </p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 group border-2 border-transparent hover:border-white hover:bg-transparent hover:text-white">
              Start Your Journey Today
              <ChevronRight className="w-5 h-5 inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}