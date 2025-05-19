"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { JSX } from 'react';
import { useTheme } from 'next-themes';
import { 
  Star, 
  Heart, 
  Clock, 
  Users, 
  BookOpen, 
  PlayCircle,
  
  Target,
  ChevronRight,
  
  Search,

  Grid,
  List,
  Zap
} from 'lucide-react';
import Image from 'next/image';

// Types
interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  sections: number;
  lectures: number;
  rating: number;
  reviews: number;
  price: string;
  originalPrice?: string;
  image: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: string;
  tag: CourseTag;
  isNew?: boolean;
  lastUpdated?: string;
  enrolled?: number;
  prerequisites?: string[];
  skills?: string[];
}

type CourseCategory = 'development' | 'medical' | 'office' | 'data-science' | 'engineering' | 'business' | 'design';
type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
type CourseTag = 'Most Popular' | 'Bestseller' | 'New' | 'Free Course' | 'Hot' | 'Featured' | 'Updated' | 'Limited Time';
type SortOption = 'rating' | 'price' | 'popularity' | 'newest' | 'alphabetical';
type ViewMode = 'grid' | 'list';

interface Category {
  id: string;
  name: string;
  count: number;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FilterState {
  category: string;
  level: CourseLevel | 'all';
  priceRange: 'all' | 'free' | 'paid';
  rating: number;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400">Please refresh the page or try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Skeleton Loader Component
const SkeletonCard: React.FC<{ viewMode: ViewMode }> = ({ viewMode }) => (
  <div
    className={`animate-pulse rounded-xl overflow-hidden ${
      viewMode === 'grid'
        ? 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        : 'flex flex-col md:flex-row border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
    }`}
  >
    <div className={viewMode === 'grid' ? 'h-48' : 'md:w-80 h-48 md:h-64'}>
      <div className="w-full h-full bg-gray-300 dark:bg-gray-700" />
    </div>
    <div className="p-6 flex-1">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2" />
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-4" />
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4" />
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
      </div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4" />
      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-full" />
    </div>
  </div>
);

// Main Component
export default function AllCoursesSection() {
  const { resolvedTheme } = useTheme();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const isDark = resolvedTheme === 'dark';
  const coursesPergil: number = 12;

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('courseFavorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
    // Simulate initial loading
    setTimeout(() => setIsInitialLoading(false), 1000);
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('courseFavorites', JSON.stringify([...favorites]));
  }, [favorites]);

  // Course data
  const courses = useMemo((): Course[] => [
    {
      id: 1,
      title: "Complete Microsoft Excel Mastery",
      description: "Master Excel from beginner to advanced with real-world projects. Learn formulas, pivot tables, macros, and data analysis techniques used by professionals.",
      instructor: "Mr Israr Muzamil, Database Expert & Microsoft Certified Trainer",
      sections: 8,
      lectures: 45,
      rating: 4.7,
      reviews: 2143,
      price: "Free",
      originalPrice: "$89.99",
      image: "/api/placeholder/400/200",
      category: "office",
      level: "Beginner",
      duration: "6 weeks",
      tag: "Most Popular",
      enrolled: 15234,
      prerequisites: ["Basic computer skills"],
      skills: ["Excel formulas", "Data analysis", "Pivot tables", "VBA basics"],
      lastUpdated: "2024-01-15",
    },
    {
      id: 2,
      title: "Full-Stack MERN Development Bootcamp",
      description: "Build production-ready web applications with MongoDB, Express.js, React, and Node.js. Includes authentication, payment integration, and deployment.",
      instructor: "Dr Angela Yu, Senior Full-Stack Developer",
      sections: 15,
      lectures: 180,
      rating: 4.9,
      reviews: 8934,
      price: "$49.99",
      originalPrice: "$199.99",
      image: "/api/placeholder/400/200",
      category: "development",
      level: "Intermediate",
      duration: "16 weeks",
      tag: "Bestseller",
      enrolled: 25678,
      prerequisites: ["JavaScript fundamentals", "HTML/CSS"],
      skills: ["React", "Node.js", "MongoDB", "Express.js", "RESTful APIs"],
      lastUpdated: "2024-02-20",
    },
    {
      id: 3,
      title: "E-commerce Platform with Next.js",
      description: "Create a scalable multi-vendor e-commerce platform using Next.js, Stripe, and modern React patterns. Perfect for building real-world applications.",
      instructor: "Sarah Johnson, Lead Frontend Architect",
      sections: 12,
      lectures: 95,
      rating: 4.6,
      reviews: 1543,
      price: "$79.99",
      originalPrice: "$149.99",
      image: "/api/placeholder/400/200",
      category: "development",
      level: "Advanced",
      duration: "14 weeks",
      tag: "New",
      isNew: true,
      enrolled: 3456,
      prerequisites: ["React experience", "JavaScript ES6+"],
      skills: ["Next.js", "TypeScript", "Stripe integration", "Database design"],
      lastUpdated: "2024-03-10",
    },
    {
      id: 4,
      title: "MDCAT 2024 Complete Preparation",
      description: "Comprehensive MDCAT preparation covering Biology, Chemistry, Physics, and English. Includes mock tests, video lectures, and expert guidance.",
      instructor: "Dr Hashim Ali, Assistant Professor at KMU",
      sections: 20,
      lectures: 250,
      rating: 4.8,
      reviews: 5643,
      price: "Free",
      originalPrice: "$199.99",
      image: "/api/placeholder/400/200",
      category: "medical",
      level: "Intermediate",
      duration: "12 weeks",
      tag: "Free Course",
      enrolled: 45670,
      prerequisites: ["High school science"],
      skills: ["Biology", "Chemistry", "Physics", "Test strategies"],
      lastUpdated: "2024-01-30",
    },
    {
      id: 5,
      title: "Advanced Data Science & AI",
      description: "Master machine learning, deep learning, and AI with Python. Build real projects including NLP, computer vision, and recommendation systems.",
      instructor: "Dr Michael Chen, AI Research Scientist",
      sections: 18,
      lectures: 200,
      rating: 4.9,
      reviews: 3892,
      price: "$89.99",
      originalPrice: "$299.99",
      image: "/api/placeholder/400/200",
      category: "data-science",
      level: "Advanced",
      duration: "20 weeks",
      tag: "Hot",
      enrolled: 12456,
      prerequisites: ["Python programming", "Statistics basics"],
      skills: ["Machine Learning", "Deep Learning", "TensorFlow", "Data visualization"],
      lastUpdated: "2024-02-28",
    },
    {
      id: 6,
      title: "Mechanical Engineering Fundamentals",
      description: "Complete foundation in mechanical engineering covering thermodynamics, fluid mechanics, materials science, and design principles.",
      instructor: "Prof. Robert Wilson, MIT",
      sections: 14,
      lectures: 120,
      rating: 4.5,
      reviews: 1256,
      price: "$59.99",
      originalPrice: "$179.99",
      image: "/api/placeholder/400/200",
      category: "engineering",
      level: "Intermediate",
      duration: "16 weeks",
      tag: "Featured",
      enrolled: 8934,
      prerequisites: ["Calculus", "Physics"],
      skills: ["CAD design", "Thermodynamics", "Materials science"],
      lastUpdated: "2024-01-20",
    },
    {
      id: 7,
      title: "Digital Marketing Mastery",
      description: "Complete digital marketing course covering SEO, social media, PPC, content marketing, and analytics. Build real campaigns.",
      instructor: "Lisa Rodriguez, Digital Marketing Director",
      sections: 10,
      lectures: 85,
      rating: 4.4,
      reviews: 2145,
      price: "$39.99",
      originalPrice: "$129.99",
      image: "/api/placeholder/400/200",
      category: "business",
      level: "Beginner",
      duration: "10 weeks",
      tag: "Updated",
      enrolled: 18765,
      prerequisites: ["Basic internet skills"],
      skills: ["SEO", "Google Ads", "Social media marketing", "Analytics"],
      lastUpdated: "2024-03-05",
    },
    {
      id: 8,
      title: "UI/UX Design Bootcamp",
      description: "Learn user interface and user experience design. Master Figma, design systems, user research, and create stunning digital products.",
      instructor: "Alex Thompson, Senior UX Designer",
      sections: 12,
      lectures: 100,
      rating: 4.7,
      reviews: 3421,
      price: "$69.99",
      originalPrice: "$199.99",
      image: "/api/placeholder/400/200",
      category: "design",
      level: "Intermediate",
      duration: "12 weeks",
      tag: "Limited Time",
      enrolled: 9876,
      prerequisites: ["Basic design knowledge"],
      skills: ["Figma", "Prototyping", "User research", "Design systems"],
      lastUpdated: "2024-02-15",
    },
  ], []);

  const categories = useMemo((): Category[] => [
    { id: 'all', name: 'All Courses', count: courses.length },
    { id: 'development', name: 'Development', count: courses.filter(c => c.category === 'development').length },
    { id: 'medical', name: 'Medical', count: courses.filter(c => c.category === 'medical').length },
    { id: 'office', name: 'Office Skills', count: courses.filter(c => c.category === 'office').length },
    { id: 'data-science', name: 'Data Science', count: courses.filter(c => c.category === 'data-science').length },
    { id: 'engineering', name: 'Engineering', count: courses.filter(c => c.category === 'engineering').length },
    { id: 'business', name: 'Business', count: courses.filter(c => c.category === 'business').length },
    { id: 'design', name: 'Design', count: courses.filter(c => c.category === 'design').length },
  ], [courses]);

  // Filtering and sorting logic
  const filteredAndSortedCourses = useMemo((): Course[] => {
    const filtered = courses.filter(course => {
      const matchesSearch = !debouncedSearchQuery ||
        course.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      const matchesCategory = filterState.category === 'all' || course.category === filterState.category;
      const matchesLevel = filterState.level === 'all' || course.level === filterState.level;
      const matchesPrice = filterState.priceRange === 'all' ||
        (filterState.priceRange === 'free' && course.price === 'Free') ||
        (filterState.priceRange === 'paid' && course.price !== 'Free');
      const matchesRating = course.rating >= filterState.rating;

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice && matchesRating;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          const priceA = a.price === 'Free' ? 0 : parseFloat(a.price.replace('$', ''));
          const priceB = b.price === 'Free' ? 0 : parseFloat(b.price.replace('$', ''));
          return priceA - priceB;
        case 'popularity':
          return (b.enrolled || 0) - (a.enrolled || 0);
        case 'newest':
          return new Date(b.lastUpdated || '').getTime() - new Date(a.lastUpdated || '').getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [courses, debouncedSearchQuery, filterState, sortBy]);

  // Pagination
  const paginatedCourses = useMemo((): Course[] => {
    const startIndex = (currentPage - 1) * coursesPergil;
    const endIndex = startIndex + coursesPergil;
    return filteredAndSortedCourses.slice(startIndex, endIndex);
  }, [filteredAndSortedCourses, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedCourses.length / coursesPergil);

  // Event handlers
  const toggleFavorite = useCallback((courseId: number): void => {
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

  const handleCategoryChange = useCallback((category: string): void => {
    setFilterState(prev => ({ ...prev, category }));
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]): void => {
    setFilterState(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((query: string): void => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((option: SortOption): void => {
    setSortBy(option);
    setCurrentPage(1);
  }, []);

  const loadMoreCourses = useCallback((): void => {
    if (currentPage < totalPages) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoading(false);
      }, 500);
    }
  }, [currentPage, totalPages]);

  // Render helpers
  const renderStars = useCallback((rating: number): JSX.Element[] => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : index < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : isDark ? 'text-gray-600' : 'text-gray-300'
        }`}
      />
    ));
  }, [isDark]);

  const getTagColor = useCallback((tag: CourseTag): string => {
    const colors: Record<CourseTag, string> = {
      'Most Popular': isDark ? 'bg-blue-600 text-blue-100' : 'bg-blue-500 text-white',
      'Bestseller': isDark ? 'bg-orange-600 text-orange-100' : 'bg-orange-500 text-white',
      'New': isDark ? 'bg-green-600 text-green-100' : 'bg-green-500 text-white',
      'Free Course': isDark ? 'bg-purple-600 text-purple-100' : 'bg-purple-500 text-white',
      'Hot': isDark ? 'bg-red-600 text-red-100' : 'bg-red-500 text-white',
      'Featured': isDark ? 'bg-indigo-600 text-indigo-100' : 'bg-indigo-500 text-white',
      'Updated': isDark ? 'bg-teal-600 text-teal-100' : 'bg-teal-500 text-white',
      'Limited Time': isDark ? 'bg-pink-600 text-pink-100' : 'bg-pink-500 text-white',
    };
    return colors[tag] || (isDark ? 'bg-gray-600 text-gray-100' : 'bg-gray-500 text-white');
  }, [isDark]);

  const formatPrice = useCallback((price: string): string => {
    return price === 'Free' ? price : price;
  }, []);

  // Course Card Component
  const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
    <div
      className={`group rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
        isDark ? 'bg-gray-800 border border-gray-700 shadow-lg' : 'bg-white border border-gray-200 shadow-lg'
      }`}
      role="article"
      aria-labelledby={`course-title-${course.id}`}
    >
      {/* Course Image */}
      <div className="relative overflow-hidden">
        <Image
          src={course.image}
          alt={course.title}
          width={500}
          height={300}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => (e.currentTarget.src = '/images/fallback-course.jpg')}
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTagColor(course.tag)}`}>
            {course.tag}
          </span>
        </div>
        {course.isNew && (
          <div className="absolute top-3 left-20">
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white animate-pulse">
              <Zap className="w-3 h-3 inline mr-1" />
              NEW
            </span>
          </div>
        )}
        <button
          onClick={() => toggleFavorite(course.id)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
            favorites.has(course.id)
              ? 'bg-red-500 text-white'
              : isDark
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          } shadow-lg hover:scale-110`}
          aria-label={favorites.has(course.id) ? `Remove ${course.title} from favorites` : `Add ${course.title} to favorites`}
        >
          <Heart className={`w-4 h-4 ${favorites.has(course.id) ? 'fill-current' : ''}`} />
        </button>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <PlayCircle className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        <div className="mb-3">
          <h3
            id={`course-title-${course.id}`}
            className={`font-bold text-lg mb-2 line-clamp-2 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {course.title}
          </h3>
          <p
            className={`text-sm line-clamp-3 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            {course.description}
          </p>
        </div>

        <div className={`text-sm mb-4 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {course.instructor}
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <BookOpen className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{course.sections} Sections</span>
          </div>
          <div className="flex items-center gap-1">
            <PlayCircle className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{course.lectures} Lectures</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{course.enrolled?.toLocaleString()}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.rating}</span>
          <div className="flex gap-1">{renderStars(course.rating)}</div>
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            ({course.reviews.toLocaleString()})
          </span>
        </div>

        {/* Skills */}
        {course.skills && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {course.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded text-xs ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {skill}
                </span>
              ))}
              {course.skills.length > 3 && (
                <span className={`px-2 py-1 rounded text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  +{course.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price and Level */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span
              className={`text-2xl font-bold ${course.price === 'Free' ? 'text-green-600' : 'text-blue-600'}`}
            >
              {formatPrice(course.price)}
            </span>
            {course.originalPrice && (
              <span className={`text-sm line-through ml-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {course.originalPrice}
              </span>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {course.level}
          </span>
        </div>

        {/* CTA Button */}
        <button
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
            isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
          } hover:shadow-lg group`}
          aria-label={course.price === 'Free' ? `Start learning ${course.title}` : `Enroll in ${course.title}`}
        >
          <span className="flex items-center justify-center gap-2">
            {course.price === 'Free' ? 'Start Learning' : 'Enroll Now'}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </button>
      </div>
    </div>
  );

  // Pagination Helper
  const renderPagination = useCallback(() => {
    if (filteredAndSortedCourses.length <= coursesPergil) return null;

    const maxPagesToShow = 5;
    const pages: (number | string)[] = [];
    let startPage: number;
    let endPage: number;

    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 3) {
        startPage = 1;
        endPage = maxPagesToShow - 1;
        pages.push(...Array.from({ length: endPage }, (_, i) => i + 1), '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 2;
        endPage = totalPages;
        pages.push(1, '...', ...Array.from({ length: maxPagesToShow - 1 }, (_, i) => startPage + i));
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
        pages.push(1, '...', ...Array.from({ length: 349}, (_, i) => currentPage - 1 + i), '...', totalPages);
      }
    }

    return (
      <div className="flex justify-center items-center gap-4 mt-12">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            currentPage === 1
              ? isDark
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isDark
              ? 'bg-gray-800 hover:bg-gray-700 text-white'
              : 'bg-white hover:bg-gray-50 text-gray-900'
          } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
          aria-label="Previous page"
        >
          Previous
        </button>

        <div className="flex gap-2">
          {pages.map((page, index) => (
            <button
              key={`${page}-${index}`}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              disabled={typeof page !== 'number'}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : typeof page === 'number'
                  ? isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-white'
                    : 'bg-white hover:bg-gray-50 text-gray-900'
                  : isDark
                  ? 'bg-gray-800 text-gray-600 cursor-default'
                  : 'bg-white text-gray-400 cursor-default'
              } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              aria-label={typeof page === 'number' ? `Page ${page}` : 'More pages'}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            currentPage === totalPages
              ? isDark
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isDark
              ? 'bg-gray-800 hover:bg-gray-700 text-white'
              : 'bg-white hover:bg-gray-50 text-gray-900'
          } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    );
  }, [currentPage, totalPages, isDark, filteredAndSortedCourses.length, coursesPergil]);

  return (
    <ErrorBoundary>
      <section
        className={`min-h-screen transition-colors duration-500 ${
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        } py-12 px-4 sm:px-6 lg:px-8`}
        aria-labelledby="courses-heading"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1
              id="courses-heading"
              className={`text-4xl md:text-5xl font-bold mb-4 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              All <span className="text-blue-600">Courses</span>
            </h1>
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <p
                className={`text-lg transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
              >
                {filteredAndSortedCourses.length} courses available
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Search courses, instructors, or topics..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors duration-300 ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    aria-label="Search courses"
                  />
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap justify-center gap-4">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value as SortOption)}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-300 ${
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

                {/* Level Filter */}
                <select
                  value={filterState.level}
                  onChange={(e) => handleFilterChange('level', e.target.value as CourseLevel | 'all')}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-300 ${
                    isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-label="Filter by level"
                >
                  <option value="all">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>

                {/* Price Filter */}
                <select
                  value={filterState.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value as 'all' | 'free' | 'paid')}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-300 ${
                    isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-label="Filter by price"
                >
                  <option value="all">All Prices</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>

                {/* Rating Filter */}
                <select
                  value={filterState.rating}
                  onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-300 ${
                    isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-label="Filter by rating"
                >
                  <option value={0}>All Ratings</option>
                  <option value={4}>4 Stars & Up</option>
                  <option value={4.5}>4.5 Stars & Up</option>
                  <option value={4.8}>4.8 Stars & Up</option>
                </select>

                {/* View Mode Toggle */}
                <div
                  className={`flex rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-300'}`}
                  role="group"
                  aria-label="View mode toggle"
                >
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : isDark
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    } transition-colors`}
                    aria-label="Grid view"
                    aria-pressed={viewMode === 'grid'}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : isDark
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    } transition-colors`}
                    aria-label="List view"
                    aria-pressed={viewMode === 'list'}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    filterState.category === category.id
                      ? isDark
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-blue-600 text-white shadow-lg'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                  aria-label={`Filter by ${category.name}`}
                  aria-pressed={filterState.category === category.id}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className={`mb-6 text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Showing {paginatedCourses.length} of {filteredAndSortedCourses.length} courses
            {debouncedSearchQuery && <span> for &quot;{debouncedSearchQuery}&quot;</span>}
          </div>

          {/* Course Grid/List */}
          {isInitialLoading ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-6'
              }
            >
              {Array.from({ length: coursesPergil }).map((_, index) => (
                <SkeletonCard key={index} viewMode={viewMode} />
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {paginatedCourses.map((course) => (
                <div
                  key={course.id}
                  className={`group rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                    isDark ? 'bg-gray-800 border border-gray-700 shadow-lg' : 'bg-white border border-gray-200 shadow-lg'
                  }`}
                  role="article"
                  aria-labelledby={`course-title-${course.id}`}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Course Image */}
                    <div className="relative md:w-80 overflow-hidden">
                      <Image
                        src={course.image}
                        width={500}
                        height={300}
                        alt={course.title}
                        className="w-full h-48 md:h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => (e.currentTarget.src = '/images/fallback-course.jpg')}
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTagColor(course.tag)}`}>
                          {course.tag}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleFavorite(course.id)}
                        className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
                          favorites.has(course.id)
                            ? 'bg-red-500 text-white'
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        } shadow-lg hover:scale-110`}
                        aria-label={
                          favorites.has(course.id)
                            ? `Remove ${course.title} from favorites`
                            : `Add ${course.title} to favorites`
                        }
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(course.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Course Content */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3
                            id={`course-title-${course.id}`}
                            className={`font-bold text-xl mb-2 transition-colors duration-300 ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {course.title}
                          </h3>
                          <p
                            className={`text-sm mb-3 transition-colors duration-300 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {course.description}
                          </p>
                          <div
                            className={`text-sm mb-4 transition-colors duration-300 ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {course.instructor}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <span
                            className={`text-2xl font-bold ${
                              course.price === 'Free' ? 'text-green-600' : 'text-blue-600'
                            }`}
                          >
                            {formatPrice(course.price)}
                          </span>
                          {course.originalPrice && (
                            <div
                              className={`text-sm line-through ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                            >
                              {course.originalPrice}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Course Stats */}
                      <div className="flex flex-wrap gap-6 mb-4 text-sm">
                        <div className="flex items-center gap-1">
                          <BookOpen className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            {course.sections} Sections
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <PlayCircle className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            {course.lectures} Lectures
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            {course.enrolled?.toLocaleString()} enrolled
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {course.level}
                          </span>
                        </div>
                      </div>

                      {/* Rating and Skills */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {course.rating}
                          </span>
                          <div className="flex gap-1">{renderStars(course.rating)}</div>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({course.reviews.toLocaleString()})
                          </span>
                        </div>

                        {course.skills && (
                          <div className="flex flex-wrap gap-1">
                            {course.skills.slice(0, 4).map((skill, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 rounded text-xs ${
                                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <button
                        className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                          isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } hover:shadow-lg group`}
                        aria-label={course.price === 'Free' ? `Start learning ${course.title}` : `Enroll in ${course.title}`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          {course.price === 'Free' ? 'Start Learning' : 'Enroll Now'}
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {filteredAndSortedCourses.length === 0 && !isInitialLoading && (
            <div className="text-center py-12">
              <div className={`text-6xl mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>📚</div>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No courses found
              </h3>
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterState({
                    category: 'all',
                    level: 'all',
                    priceRange: 'all',
                    rating: 0,
                  });
                }}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
                aria-label="Clear all filters"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {renderPagination()}

          {/* Load More Button */}
          {currentPage < totalPages && !isInitialLoading && (
            <div className="text-center mt-8">
              <button
                onClick={loadMoreCourses}
                disabled={isLoading}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                    : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
                } shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Load more courses"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  `Load More Courses (${filteredAndSortedCourses.length - currentPage * coursesPergil} remaining)`
                )}
              </button>
            </div>
          )}

          {/* Statistics Bar */}
          <div
            className={`mt-16 p-6 rounded-xl ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            } shadow-lg`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{courses.length}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Courses
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {courses.filter(c => c.price === 'Free').length}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Free Courses
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {(courses.reduce((acc, c) => acc + c.rating, 0) / courses.length).toFixed(1)}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Avg. Rating
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {courses.reduce((acc, c) => acc + (c.enrolled || 0), 0).toLocaleString()}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Students
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
}