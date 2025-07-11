import { Star } from 'lucide-react';

export const formatDuration = (duration: number | string): string => {
  if (typeof duration === 'string') {
    const [hours, minutes] = duration.split(':').map(Number);
    return `${hours}h ${minutes}m`;
  }
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return `${hours}h ${minutes}m`;
};

export const renderStars = (rating: number, isDark: boolean) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : isDark ? 'text-gray-600' : 'text-gray-300'}`}
    />
  ));

export const getLevelColor = (level: string, isDark: boolean): string => {
  const colors: Record<string, string> = {
    Beginner: isDark ? 'bg-green-600 text-green-100' : 'bg-green-500 text-white',
    Intermediate: isDark ? 'bg-yellow-600 text-yellow-100' : 'bg-yellow-500 text-white',
    Advanced: isDark ? 'bg-red-600 text-red-100' : 'bg-red-500 text-white',
  };
  return colors[level] || (isDark ? 'bg-gray-600 text-gray-100' : 'bg-gray-500 text-white');
};