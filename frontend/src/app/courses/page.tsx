"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Star, Heart, Clock, Users, BookOpen, PlayCircle, Search, Grid, List } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import { motion } from 'framer-motion';

// Types
interface CourseInstructor {
  name: string;
  bio: string;
  avatar: string;
}

interface CourseThumbnail {
  public_id: string;
  url: string;
}

interface Course {
  _id: string;
  name: string;
  description: string;
  instructor: CourseInstructor;
  sections: number;
  lectures: number;
  rating: number;
  purchased: number;
  price: number;
  thumbnail: CourseThumbnail;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

interface FilterState {
  category: string;
  level: string;
  priceRange: string;
  rating: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type SortOption = 'rating' | 'price' | 'popularity' | 'newest' | 'alphabetical';
type ViewMode = 'grid' | 'list';

// Animation Variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { y: -2, transition: { duration: 0.2 } },
};

// Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Skeleton Loader Component
const SkeletonCard: React.FC<{ viewMode: ViewMode }> = ({ viewMode }) => {
  return (
    <motion.div
      variants={cardVariants}
      className={`animate-pulse rounded-xl border ${
        viewMode === 'grid'
          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          : 'flex flex-col md:flex-row bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className={viewMode === 'grid' ? 'h-48' : 'md:w-64 h-48 md:h-56'}>
        <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded-t-xl" />
      </div>
      <div className="p-4 flex-1 space-y-3">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
        </div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
      </div>
    </motion.div>
  );
};

// Main Component
export default function CoursesList() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterState, setFilterState] = useState<FilterState>({
    category: 'all',
    level: 'all',
    priceRange: 'all',
    rating: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isDark = resolvedTheme === 'dark';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const coursesPerPage = 12;

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get<ApiResponse<Course[]>>(`${baseUrl}/api/v1/get-courses`);
        if (response.data.success) {
          const normalizedCourses = response.data.data.map((course, index) => ({
            ...course,
            _id: course._id ?? `fallback-${index}`,
            thumbnail: course.thumbnail?.url
              ? { public_id: course.thumbnail.public_id, url: course.thumbnail.url }
              : { public_id: `fallback-${index}`, url: '/images/fallback-course.jpg' },
            instructor: {
              name: course.instructor?.name || 'Unknown Instructor',
              bio: course.instructor?.bio || 'No bio available',
              avatar: course.instructor?.avatar || '/images/instructor-placeholder.jpg',
            },
          }));
          setCourses(normalizedCourses);
        } else {
          setError(response.data.message || 'Failed to fetch courses');
        }
      } catch (err: unknown) {
         console.log('Courses not found, using fallback data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [baseUrl]);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('courseFavorites');
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      }
    } catch (err: unknown) {
      console.warn('Failed to parse favorites from localStorage', err);
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('courseFavorites', JSON.stringify([...favorites]));
    } catch (err: unknown) {
      console.warn('Failed to save favorites to localStorage', err);
    }
  }, [favorites]);

  // Categories
  const categories = useMemo((): Category[] => [
    { id: 'all', name: 'All Courses', count: courses.length },
    ...Array.from(new Set(courses.map(c => c.category))).map(cat => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: courses.filter(c => c.category === cat).length,
    })),
  ], [courses]);

  // Filtering and sorting
  const filteredAndSortedCourses = useMemo(() => {
    const filtered = courses.filter(course => {
      const matchesSearch = !debouncedSearchQuery ||
        course.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        course.instructor.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesCategory = filterState.category === 'all' || course.category === filterState.category;
      const matchesLevel = filterState.level === 'all' || course.level === filterState.level;
      const matchesPrice = filterState.priceRange === 'all' ||
        (filterState.priceRange === 'free' && course.price === 0) ||
        (filterState.priceRange === 'paid' && course.price > 0);
      const matchesRating = course.rating >= filterState.rating;
      return matchesSearch && matchesCategory && matchesLevel && matchesPrice && matchesRating;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'price': return a.price - b.price;
        case 'popularity': return (b.purchased || 0) - (a.purchased || 0);
        case 'newest': return new Date(b.updatedAt || b.createdAt || '').getTime() - new Date(a.updatedAt || a.createdAt || '').getTime();
        case 'alphabetical': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return filtered;
  }, [courses, debouncedSearchQuery, filterState, sortBy]);

  // Pagination
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    return filteredAndSortedCourses.slice(startIndex, startIndex + coursesPerPage);
  }, [filteredAndSortedCourses, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedCourses.length / coursesPerPage);

  // Event handlers
  const toggleFavorite = useCallback((courseId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(courseId)) {
        newFavorites.delete(courseId);
      } else {
        newFavorites.add(courseId);
      }
      return newFavorites;
    });
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setFilterState(prev => ({ ...prev, category }));
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((option: SortOption) => {
    setSortBy(option);
    setCurrentPage(1);
  }, []);

  const handleCourseClick = useCallback((courseId: string) => {
    router.push(`/courses/${courseId}`);
  }, [router]);

  // Render helpers
  const renderStars = useCallback((rating: number) => (
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : isDark ? 'text-gray-600' : 'text-gray-300'}`}
      />
    ))
  ), [isDark]);

  const getTagColor = useCallback((tag: string) => {
    const colors: Record<string, string> = {
      'Most Popular': isDark ? 'bg-blue-600 text-blue-100' : 'bg-blue-500 text-white',
      'Bestseller': isDark ? 'bg-orange-600 text-orange-100' : 'bg-orange-500 text-white',
      'New': isDark ? 'bg-green-600 text-green-100' : 'bg-green-500 text-white',
      'Free': isDark ? 'bg-purple-600 text-purple-100' : 'bg-purple-500 text-white',
      'Hot': isDark ? 'bg-red-600 text-red-100' : 'bg-red-500 text-white',
      'Featured': isDark ? 'bg-indigo-600 text-indigo-100' : 'bg-indigo-500 text-white',
      'Updated': isDark ? 'bg-teal-600 text-teal-100' : 'bg-teal-500 text-white',
      'Limited Time': isDark ? 'bg-pink-600 text-pink-100' : 'bg-pink-500 text-white',
    };
    return colors[tag] || (isDark ? 'bg-gray-600 text-gray-100' : 'bg-gray-500 text-white');
  }, [isDark]);

  // Course Card Component
  const CourseCard: React.FC<{ course: Course; viewMode: ViewMode }> = ({ course, viewMode }) => (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`group rounded-xl overflow-hidden border cursor-pointer ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } hover:shadow-xl transition-all duration-300 ${
        viewMode === 'grid' ? '' : 'flex flex-col md:flex-row'
      }`}
      role="article"
      aria-labelledby={`course-title-${course._id}`}
      onClick={() => handleCourseClick(course._id)}
    >
      <div className={viewMode === 'grid' ? 'h-48' : 'md:w-64 h-48 md:h-56 relative'}>
        <Image
          src={course.thumbnail.url}
          alt={course.name || 'Course image'}
          width={400}
          height={200}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/images/fallback-course.jpg';
          }}
        />
        {course.tags[0] && (
          <span className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${getTagColor(course.tags[0])}`}>
            {course.tags[0]}
          </span>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(course._id);
          }}
          className={`absolute top-2 right-2 p-1 rounded-full ${
            favorites.has(course._id)
              ? 'bg-red-500 text-white'
              : isDark
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
          aria-label={favorites.has(course._id) ? `Remove ${course.name} from favorites` : `Add ${course.name} to favorites`}
        >
          <Heart className={`w-4 h-4 ${favorites.has(course._id) ? 'fill-current' : ''}`} />
        </motion.button>
      </div>
      <div className="p-4 flex-1">
        <h3
          id={`course-title-${course._id}`}
          className={`font-semibold text-lg line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          {course.name}
        </h3>
        <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
          {course.description}
        </p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
          {course.instructor.name}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
          <div className="flex items-center gap-1">
            <BookOpen className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span>{course.sections} Sections</span>
          </div>
          <div className="flex items-center gap-1">
            <PlayCircle className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span>{course.lectures} Lectures</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span>{`${Math.floor(course.duration / 60)}h ${course.duration % 60}m`}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span>{course.purchased.toLocaleString()} enrolled</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.rating}</span>
          <div className="flex gap-1">{renderStars(course.rating)}</div>
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>({course.purchased})</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className={`text-lg font-semibold ${course.price === 0 ? 'text-green-600' : 'text-blue-600'}`}>
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            {course.level}
          </span>
        </div>
      </div>
    </motion.div>
  );

  // Pagination
  const renderPagination = useCallback(() => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center gap-2 mt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded border ${
            currentPage === 1
              ? isDark
                ? 'bg-gray-800 text-gray-600 border-gray-700'
                : 'bg-gray-200 text-gray-400 border-gray-200'
              : isDark
              ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
              : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
          }`}
          aria-label="Previous page"
        >
          Previous
        </motion.button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <motion.button
            key={page}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded border ${
              currentPage === page
                ? 'bg-blue-600 text-white border-blue-600'
                : isDark
                ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
                : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
            }`}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded border ${
            currentPage === totalPages
              ? isDark
                ? 'bg-gray-800 text-gray-600 border-gray-700'
                : 'bg-gray-200 text-gray-400 border-gray-200'
              : isDark
              ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
              : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
          }`}
          aria-label="Next page"
        >
          Next
        </motion.button>
      </div>
    );
  }, [currentPage, totalPages, isDark]);

  // Error Display
  if (error) {
    return (
      <motion.section
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center p-6`}
      >
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {error}
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className={`px-6 py-3 rounded-lg text-sm font-medium ${
              isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
            } shadow-lg`}
            aria-label="Retry"
          >
            Try Again
          </motion.button>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className={`py-8 px-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
      aria-labelledby="courses-heading"
    >
      <div className="max-w-7xl mx-auto">
        <h1
          id="courses-heading"
          className={`text-3xl font-bold text-center mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          All Courses
        </h1>
        <motion.div variants={cardVariants} className="mb-6">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <div className="relative max-w-md w-full">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                aria-label="Search courses"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as SortOption)}
              className={`px-4 py-2 rounded border ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label="Sort courses"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price">Price: Low to High</option>
              <option value="newest">Newest</option>
              <option value="alphabetical">A-Z</option>
            </select>
            <select
              value={filterState.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className={`px-4 py-2 rounded border ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label="Filter by level"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select
              value={filterState.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              className={`px-4 py-2 rounded border ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label="Filter by price"
            >
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <select
              value={filterState.rating}
              onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
              className={`px-4 py-2 rounded border ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label="Filter by rating"
            >
              <option value={0}>All Ratings</option>
              <option value={4}>4 Stars & Up</option>
              <option value={4.5}>4.5 Stars & Up</option>
            </select>
            <div className={`flex rounded border ${isDark ? 'border-gray-700' : 'border-gray-300'}`} role="group" aria-label="View mode toggle">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : isDark ? 'text-gray-400' : 'text-gray-600'}`}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <Grid className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : isDark ? 'text-gray-400' : 'text-gray-600'}`}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
              >
                <List className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full text-sm ${
                  filterState.category === category.id
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                } border`}
                aria-label={`Filter by ${category.name}`}
              >
                {category.name} ({category.count})
              </motion.button>
            ))}
          </div>
        </motion.div>
        <div className={`text-center mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Showing {paginatedCourses.length} of {filteredAndSortedCourses.length} courses
          {debouncedSearchQuery && <span> for &quot;{debouncedSearchQuery}&quot;</span>}
        </div>
        {isLoading ? (
          <motion.div
            variants={cardVariants}
            className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}
          >
            {Array.from({ length: coursesPerPage }).map((_, i) => (
              <SkeletonCard key={i} viewMode={viewMode} />
            ))}
          </motion.div>
        ) : filteredAndSortedCourses.length === 0 ? (
          <motion.div variants={cardVariants} className="text-center py-8">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>No courses found</h3>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Try adjusting your search or filters.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchQuery('');
                setFilterState({ category: 'all', level: 'all', priceRange: 'all', rating: 0 });
              }}
              className={`mt-4 px-4 py-2 rounded text-sm ${
                isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              Clear Filters
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={cardVariants}
            className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}
          >
            {paginatedCourses.map((course, index) => (
              <CourseCard key={course._id ?? `fallback-${index}`} course={course} viewMode={viewMode} />
            ))}
          </motion.div>
        )}
        {renderPagination()}
      </div>
    </motion.section>
  );
}

