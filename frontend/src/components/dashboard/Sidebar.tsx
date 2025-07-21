'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { FaUsers, FaBook, FaChartBar, FaBell, FaShoppingCart, FaCogs, FaSignOutAlt, FaChevronRight, FaBars, FaTimes } from 'react-icons/fa';
import { useState, useEffect } from 'react';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'slate';
  description: string;
}

interface ColorConfig {
  active: string;
  hover: string;
  icon: string;
  iconBg: string;
}

type ColorMap = Record<MenuItem['color'], Omit<ColorConfig, 'iconBg'>>;

export default function Sidebar() {
  const router = useRouter();
  const { logout } = useAuth();
  const [activeItem, setActiveItem] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set active item based on current path
    const currentPath = window.location.pathname;
    const currentItem = menuItems.find(item => item.path === currentPath);
    if (currentItem) {
      setActiveItem(currentItem.name);
    }

    // Handle responsive behavior
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
        setIsCollapsed(false);
      } else if (window.innerWidth >= 768) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isMobileOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(e.target as Node)) {
          setIsMobileOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  const menuItems: MenuItem[] = [
    { 
      name: 'Users', 
      path: '/admin-dashboard/users', 
      icon: <FaUsers className="w-5 h-5" />,
      color: 'blue',
      description: 'Manage user accounts'
    },
    { 
      name: 'Courses', 
      path: '/admin-dashboard/courses', 
      icon: <FaBook className="w-5 h-5" />,
      color: 'emerald',
      description: 'Course management'
    },
    { 
      name: 'Analytics', 
      path: '/admin-dashboard/analytics', 
      icon: <FaChartBar className="w-5 h-5" />,
      color: 'purple',
      description: 'View reports & insights'
    },
    { 
      name: 'Notifications', 
      path: '/admin-dashboard/notifications', 
      icon: <FaBell className="w-5 h-5" />,
      color: 'amber',
      description: 'System notifications'
    },
    { 
      name: 'Orders', 
      path: '/admin-dashboard/orders', 
      icon: <FaShoppingCart className="w-5 h-5" />,
      color: 'rose',
      description: 'Order management'
    },
    { 
      name: 'Settings', 
      path: '/admin-dashboard/layouts', 
      icon: <FaCogs className="w-5 h-5" />,
      color: 'slate',
      description: 'System configuration'
    },
  ];

  const getItemClasses = (item: MenuItem) => {
    const isActive = activeItem === item.name;
    const colorMap: ColorMap = {
      blue: {
        active: 'bg-gradient-to-r from-blue-500/15 to-blue-600/15 border-blue-500/40 text-blue-100',
        hover: 'hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-blue-600/10 hover:border-blue-500/30',
        icon: 'text-blue-400'
      },
      emerald: {
        active: 'bg-gradient-to-r from-emerald-500/15 to-emerald-600/15 border-emerald-500/40 text-emerald-100',
        hover: 'hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-emerald-600/10 hover:border-emerald-500/30',
        icon: 'text-emerald-400'
      },
      purple: {
        active: 'bg-gradient-to-r from-purple-500/15 to-purple-600/15 border-purple-500/40 text-purple-100',
        hover: 'hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-purple-600/10 hover:border-purple-500/30',
        icon: 'text-purple-400'
      },
      amber: {
        active: 'bg-gradient-to-r from-amber-500/15 to-amber-600/15 border-amber-500/40 text-amber-100',
        hover: 'hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-amber-600/10 hover:border-amber-500/30',
        icon: 'text-amber-400'
      },
      rose: {
        active: 'bg-gradient-to-r from-rose-500/15 to-rose-600/15 border-rose-500/40 text-rose-100',
        hover: 'hover:bg-gradient-to-r hover:from-rose-500/10 hover:to-rose-600/10 hover:border-rose-500/30',
        icon: 'text-rose-400'
      },
      slate: {
        active: 'bg-gradient-to-r from-slate-500/15 to-slate-600/15 border-slate-500/40 text-slate-100',
        hover: 'hover:bg-gradient-to-r hover:from-slate-500/10 hover:to-slate-600/10 hover:border-slate-500/30',
        icon: 'text-slate-400'
      }
    };

    const colors = colorMap[item.color];
    const iconBg = isActive ? `bg-${item.color}-500/20` : 'bg-slate-800/60';
    
    return {
      container: `group relative flex items-center ${isCollapsed ? 'justify-center p-3' : 'p-4'} mx-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out border border-transparent ${
        isActive 
          ? `${colors.active} shadow-lg backdrop-blur-sm transform scale-105` 
          : `${colors.hover} hover:shadow-md text-slate-300 hover:text-slate-100 hover:scale-102`
      }`,
      iconContainer: `flex items-center justify-center ${isCollapsed ? 'w-10 h-10' : 'w-10 h-10'} rounded-lg transition-all duration-300 ${iconBg}`,
      icon: `${colors.icon} transition-all duration-300`,
      chevron: `transition-all duration-300 ${
        isActive 
          ? `${colors.icon} rotate-90` 
          : 'text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1'
      }`
    };
  };

  const handleItemClick = (item: MenuItem) => {
    setActiveItem(item.name);
    router.push(item.path);
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-3 bg-slate-800 text-white rounded-xl shadow-lg lg:hidden hover:bg-slate-700 transition-all duration-300"
        aria-label="Open sidebar"
      >
        <FaBars className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`${
          isCollapsed ? 'w-20' : 'w-80'
        } h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-r border-slate-700/30 backdrop-blur-sm transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed z-50`}
      >
        {/* Header */}
        <div className={`${isCollapsed ? 'p-4' : 'p-6'} border-b border-slate-700/30 backdrop-blur-sm transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
              </div>
              {!isCollapsed && (
                <div className="flex-1">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h2>
                  <p className="text-slate-400 text-sm font-medium">Management Portal</p>
                </div>
              )}
            </div>
            
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 lg:hidden"
            >
              <FaTimes className="w-5 h-5" />
            </button>
            
            {/* Collapse button for desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 hidden lg:block"
            >
              <FaBars className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 space-y-2 flex-1 overflow-y-auto">
          <div className="mb-6">
            {!isCollapsed && (
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
                Main Menu
              </p>
            )}
            {menuItems.map((item) => {
              const classes = getItemClasses(item);
              return (
                <div
                  key={item.name}
                  className={classes.container}
                  onClick={() => handleItemClick(item)}
                  title={isCollapsed ? item.name : ''}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'} flex-1`}>
                    <div className={classes.iconContainer}>
                      <div className={classes.icon}>
                        {item.icon}
                      </div>
                    </div>
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm block truncate">
                          {item.name}
                        </span>
                        <span className="text-xs text-slate-400 block truncate">
                          {item.description}
                        </span>
                      </div>
                    )}
                  </div>
                  {!isCollapsed && (
                    <FaChevronRight className={`w-3 h-3 ${classes.chevron}`} />
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-slate-700/30 backdrop-blur-sm transition-all duration-300`}>
          {!isCollapsed && (
            <div className="mb-4">
              <div className="h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent"></div>
            </div>
          )}
          
          <div
            className={`group flex items-center ${isCollapsed ? 'justify-center p-3' : 'p-4'} rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/10 hover:shadow-md text-slate-300 hover:text-slate-100 border border-transparent hover:border-red-500/20 hover:scale-102`}
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : ''}
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'} flex-1`}>
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800/60 group-hover:bg-red-500/20 transition-all duration-300">
                <FaSignOutAlt className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-all duration-300" />
              </div>
              {!isCollapsed && (
                <div className="flex-1">
                  <span className="font-medium text-sm block">Logout</span>
                  <span className="text-xs text-slate-400 block">Sign out of account</span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <FaChevronRight className="w-3 h-3 text-slate-500 group-hover:text-red-300 group-hover:translate-x-1 transition-all duration-300" />
            )}
          </div>
        </div>
      </div>

      {/* Spacer for main content */}
      <div className={`${isCollapsed ? 'w-20' : 'w-80'} hidden lg:block transition-all duration-300`} />
    </>
  );
}