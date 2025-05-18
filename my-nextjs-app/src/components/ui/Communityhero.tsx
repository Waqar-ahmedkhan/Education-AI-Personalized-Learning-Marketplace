"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Users, Globe, Star, Play, Volume2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CommunityHero = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [ballPositions, setBallPositions] = useState([0, 120, 240]);
  const circleRef = useRef<HTMLDivElement>(null);

  const toggleVideo = () => setIsVideoPlaying(!isVideoPlaying);

  useEffect(() => {
    const interval = setInterval(() => {
      setBallPositions(prev => prev.map(pos => (pos + 0.8) % 360));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      icon: Users,
      number: "10.2k",
      label: "User Rating",
      description: "Active community members sharing knowledge",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Globe,
      number: "5K+",
      label: "Daily Visitors",
      description: "Learners visiting daily to enhance skills",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Star,
      number: "4.9/5",
      label: "Students Rating",
      description: "Average satisfaction from our community",
      gradient: "from-green-500 to-green-600"
    }
  ];

  interface BallPosition {
    x: number;
    y: number;
  }

  const getBallPosition = (angle: number, radius: number): BallPosition => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    };
  };

  const ballColors = [
    { bg: 'bg-blue-500', glow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' },
    { bg: 'bg-purple-500', glow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' },
    { bg: 'bg-green-500', glow: 'drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]' }
  ];

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-32 right-32 w-48 h-48 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/25 bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,white_70%,transparent_100%)]" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4">
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Join Our Vibrant
            </span>
            <span className="block text-slate-800 dark:text-slate-100 mt-2">
              Programming Community
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Connect with thousands of developers, share knowledge, and grow together in our supportive community.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative max-w-5xl mx-auto mb-12 sm:mb-16 lg:mb-20"
        >
          <div className="relative flex justify-center items-center" style={{ height: 'clamp(300px, 50vw, 450px)' }}>
            <div ref={circleRef} className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
              <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
                isVideoPlaying 
                  ? 'shadow-[0_0_40px_rgba(59,130,246,0.3)] dark:shadow-[0_0_40px_rgba(59,130,246,0.2)]'
                  : 'shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]'
              }`}></div>

              <Card className={`absolute inset-0 rounded-full border border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 backdrop-blur-lg transition-all duration-700 ${
                isVideoPlaying ? 'border-blue-500/50 dark:border-blue-400/50' : ''
              }`}>
                <CardContent className="p-4 h-full">
                  <div className="absolute inset-4 rounded-full overflow-hidden">
                    {isVideoPlaying ? (
                      <div className="w-full h-full bg-gradient-to-br from-white/50 to-gray-100/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-full flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 animate-pulse"></div>
                        <div className="relative text-center z-10">
                          <div className="w-16 h-16 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-xl mb-4 mx-auto flex items-center justify-center animate-pulse">
                            <Volume2 size={24} className="text-slate-600 dark:text-slate-300" />
                          </div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Video Playing...</p>
                          <div className="flex justify-center mt-3 space-x-1">
                            {[...Array(3)].map((_, i) => (
                              <div 
                                key={i}
                                className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.2}s` }}
                              ></div>
                            ))}
                          </div>
                        </div>
                        <Button
                          onClick={toggleVideo}
                          variant="ghost"
                          size="icon"
                          className="absolute top-3 right-3 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-lg hover:bg-white dark:hover:bg-slate-700"
                        >
                          <X size={16} className="text-slate-600 dark:text-slate-300" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={toggleVideo}
                        variant="ghost"
                        className="w-full h-full rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm flex items-center justify-center transition-all duration-500 hover:scale-105"
                      >
                        <div className="text-center">
                          <div className="relative mbzeba mb-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 shadow-xl flex items-center justify-center">
                              <Play size={24} className="text-white ml-1" />
                            </div>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 animate-ping opacity-20"></div>
                          </div>
                          <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">
                            Preview Community
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            Watch the video
                          </p>
                        </div>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {ballPositions.map((angle, index) => {
                const radius = typeof window !== 'undefined' ? (window.innerWidth < 640 ? 150 : window.innerWidth < 1024 ? 180 : 200) : 200;
                const position = getBallPosition(angle, radius);
                const ballColor = ballColors[index];
                return (
                  <motion.div
                    key={index}
                    className={`absolute w-4 h-4 sm:w-5 sm:h-5 rounded-full ${ballColor.bg} ${ballColor.glow} shadow-lg`}
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                    }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    <div className={`absolute inset-0 rounded-full ${ballColor.bg} animate-ping opacity-30`}></div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300"
              >
                <CardContent className="p-6 flex items-start gap-4">
                  <motion.div
                    className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon size={24} className="text-white" />
                  </motion.div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">{stat.number}</div>
                    <div className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{stat.label}</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="text-center mt-12 sm:mt-16"
        >
          <div className="inline-flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
            <Button
              size="lg"
              className="px-8 py-5 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Join Community
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-5 text-base font-semibold border-2 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-xl transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunityHero;