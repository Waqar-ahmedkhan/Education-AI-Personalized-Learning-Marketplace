import React from 'react';
import { Zap } from 'lucide-react';
import FloatingCard from './FloatingCard';

interface GamificationCardProps {
  xp: number;
  badges: string[];
  index: number;
}

const GamificationCard: React.FC<GamificationCardProps> = ({ xp, badges, index }) => (
  <FloatingCard delay={index * 0.1} className="group">
    <div className="flex items-center space-x-3 sm:space-x-4">
      <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-md group-hover:scale-110 transition-transform duration-300">
        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div>
        <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
          Gamification
        </h3>
        <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          {xp} XP
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
          Badges: {badges.length > 0 ? badges.join(', ') : 'None'}
        </p>
      </div>
    </div>
  </FloatingCard>
);

export default GamificationCard;