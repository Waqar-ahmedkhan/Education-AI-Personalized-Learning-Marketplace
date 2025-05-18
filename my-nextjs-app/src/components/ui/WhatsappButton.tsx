"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 2
      }}
    >
      <motion.a
        href="https://wa.me/1234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          {/* Animated pulse rings */}
          <motion.div
            className="absolute inset-0 rounded-full bg-green-500 opacity-25"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-green-500 opacity-25"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />

          {/* Main button */}
          <div className="relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-green-400 dark:to-green-500 dark:hover:from-green-500 dark:hover:to-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 group-hover:shadow-2xl">
            <MessageCircle className="h-6 w-6" />
          </div>

          {/* Enhanced tooltip */}
          <div className="absolute right-full top-1/2 mr-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <div className="bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg border border-slate-600 dark:border-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Need help? Chat with us!
              </div>
              {/* Tooltip arrow */}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2">
                <div className="w-0 h-0 border-l-8 border-r-0 border-t-4 border-b-4 border-l-slate-800 dark:border-l-slate-700 border-t-transparent border-b-transparent"></div>
              </div>
            </div>
          </div>

          {/* Notification badge */}
          <motion.div
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            1
          </motion.div>
        </div>
      </motion.a>
    </motion.div>
  );
}