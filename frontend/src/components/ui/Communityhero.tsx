"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Users, Globe, Star, Play, Volume2, VolumeX, Maximize2, X } from 'lucide-react';

const CommunityHero = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [ballPositions, setBallPositions] = useState([0, 120, 240]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const circleRef = useRef<HTMLDivElement>(null);

  const YOUTUBE_VIDEO_ID = "6nDmtt1I4TY";
  const YOUTUBE_EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&showinfo=0`;

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
    let progress = 0;
    const loadingInterval = setInterval(() => {
      progress += 10;
      setLoadingProgress(progress);
      if (progress >= 100) {
        clearInterval(loadingInterval);
        setIsVideoLoaded(true);
      }
    }, 150);
  };

  const handleCloseVideo = () => {
    setIsVideoPlaying(false);
    setIsVideoLoaded(false);
    setLoadingProgress(0);
    setShowControls(false);
  };

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

  const getBallPosition = (angle: number, radius: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    };
  };

  const ballColors = [
    { bg: 'bg-blue-500', glow: 'drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]' },
    { bg: 'bg-purple-500', glow: 'drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]' },
    { bg: 'bg-green-500', glow: 'drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]' }
  ];

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/25 bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,white_70%,transparent_100%)]" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
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
        </div>

        <div className="relative max-w-6xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          <div className="relative flex justify-center items-center min-h-[400px] lg:min-h-[500px]">
            <div ref={circleRef} className="relative">
              <div className={`relative transition-all duration-1000 ease-out ${
                isVideoPlaying 
                  ? 'w-[500px] h-[320px] sm:w-[600px] sm:h-[380px] lg:w-[700px] lg:h-[420px]' 
                  : 'w-80 h-80 sm:w-96 sm:h-96 lg:w-[450px] lg:h-[450px]'
              }`}>
                <div className={`absolute inset-0 transition-all duration-1000 ${
                  isVideoPlaying 
                    ? 'rounded-2xl shadow-[0_0_80px_rgba(59,130,246,0.3)] dark:shadow-[0_0_80px_rgba(59,130,246,0.2)]'
                    : 'rounded-full shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.05)]'
                }`}></div>

                <div className={`absolute inset-0 border backdrop-blur-2xl transition-all duration-1000 overflow-hidden ${
                  isVideoPlaying 
                    ? 'rounded-2xl border-blue-500/30 dark:border-blue-400/30 bg-slate-900/95 dark:bg-slate-800/95'
                    : 'rounded-full border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50'
                }`}>
                  {isVideoPlaying ? (
                    <div className="relative w-full h-full">
                      {!isVideoLoaded ? (
                        <div className="flex flex-col items-center justify-center h-full p-8">
                          <div className="relative mb-8">
                            <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                            <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-r-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">Loading Video...</h3>
                          <p className="text-slate-300 text-sm mb-6">Preparing your community preview</p>
                          <div className="w-64 bg-slate-700 rounded-full h-2 mb-4 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transition-all duration-300 ease-out rounded-full relative"
                              style={{ width: `${loadingProgress}%` }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                            </div>
                          </div>
                          <span className="text-blue-400 text-sm font-medium">{loadingProgress}%</span>
                        </div>
                      ) : (
                        <div className="relative w-full h-full">
                          <iframe
                            src={YOUTUBE_EMBED_URL}
                            className="w-full h-full rounded-2xl"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Community Preview Video"
                          ></iframe>
                          <div 
                            className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 rounded-2xl transition-opacity duration-300 ${
                              showControls ? 'opacity-100' : 'opacity-0'
                            }`}
                            onMouseEnter={() => setShowControls(true)}
                            onMouseLeave={() => setShowControls(false)}
                          >
                            <div className="absolute top-4 right-4 flex gap-2">
                              <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-200 backdrop-blur-sm"
                              >
                                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                              </button>
                              <button
                                onClick={handleCloseVideo}
                                className="p-2 rounded-full bg-black/30 hover:bg-red-500/80 text-white transition-all duration-200 backdrop-blur-sm"
                              >
                                <X size={18} />
                              </button>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="flex items-center gap-3">
                                <button className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-200 backdrop-blur-sm">
                                  <Play size={16} />
                                </button>
                                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                  <div className="h-full bg-red-500 rounded-full" style={{ width: '30%' }}></div>
                                </div>
                                <button className="p-1 rounded bg-black/30 hover:bg-black/50 text-white transition-all duration-200 backdrop-blur-sm">
                                  <Maximize2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={handlePlayVideo}
                      className="w-full h-full relative overflow-hidden transition-all duration-500 hover:scale-[1.02] group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-indigo-50/50 dark:from-slate-800/50 dark:via-slate-900/30 dark:to-slate-800/50 group-hover:from-blue-100/60 dark:group-hover:from-slate-700/60 transition-all duration-500"></div>
                      <div className="absolute inset-0">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/40 rounded-full animate-float"></div>
                        <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-indigo-400/40 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                      </div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                          <div className="absolute -inset-4 rounded-full border border-blue-200/40 dark:border-blue-600/40 group-hover:border-blue-300/60 dark:group-hover:border-blue-500/60 transition-all duration-500"></div>
                          <div className="absolute -inset-2 rounded-full border-2 border-blue-300/30 dark:border-blue-500/30 group-hover:border-blue-400/50 dark:group-hover:border-blue-400/50 transition-all duration-300"></div>
                          <div className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500 shadow-2xl group-hover:shadow-blue-500/25 dark:group-hover:shadow-blue-400/25 group-hover:scale-110 transition-all duration-500 flex items-center justify-center">
                            <Play size={32} className="text-white ml-1 group-hover:scale-110 transition-transform duration-300" fill="currentColor" />
                            <div className="absolute inset-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-all duration-300"></div>
                          </div>
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500 animate-ping opacity-20 group-hover:opacity-30"></div>
                        </div>
                      </div>
                      <div className="absolute bottom-5 left-0 right-0 text-center">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                          Preview Community
                        </h3>
                        <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300 font-medium">
                          Watch our community showcase
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="font-medium">Click to play video</span>
                        </div>
                      </div>
                      <div className="absolute inset-0 opacity-5 dark:opacity-10" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                        backgroundSize: '20px 20px'
                      }}></div>
                    </button>
                  )}
                </div>
              </div>
              {!isVideoPlaying && ballPositions.map((angle, index) => {
                const radius = typeof window !== 'undefined' ? (window.innerWidth < 640 ? 170 : window.innerWidth < 1024 ? 200 : 250) : 250;
                const position = getBallPosition(angle, radius);
                const ballColor = ballColors[index];
                return (
                  <div
                    key={index}
                    className={`absolute w-5 h-5 sm:w-6 sm:h-6 rounded-full ${ballColor.bg} ${ballColor.glow} shadow-xl transition-all duration-300`}
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                    }}
                  >
                    <div className={`absolute inset-0 rounded-full ${ballColor.bg} animate-ping opacity-60`}></div>
                    <div className="absolute inset-0.5 rounded-full bg-white/20 animate-pulse"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12 sm:mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-500 rounded-2xl p-6 group hover:scale-105 hover:shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-purple-50/10 to-indigo-50/20 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-start gap-4">
                  <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{stat.number}</div>
                    <div className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">{stat.label}</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{stat.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4 p-4 rounded-3xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <button className="px-10 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 relative overflow-hidden group">
              <span className="relative z-10">Join Community</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button className="px-10 py-4 text-lg font-semibold border-2 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl transition-all duration-500 bg-white/50 dark:bg-slate-800/50 hover:scale-105 transform">
              Learn More
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default CommunityHero;