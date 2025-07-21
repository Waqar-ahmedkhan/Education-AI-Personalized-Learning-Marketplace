import React from 'react';
import FloatingCard from './FloatingCard';

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  color: string;
  index: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, title, value, subtitle, color, index }) => (
  <FloatingCard delay={index * 0.1} className="group">
    <div className="flex items-center space-x-3 sm:space-x-4">
      <div className={`p-2 sm:p-3 rounded-2xl bg-gradient-to-br ${color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div>
        <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
          {title}
        </h3>
        <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  </FloatingCard>
);

export default StatsCard;