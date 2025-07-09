'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { User, Settings, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';

export default function UserProfileDropdown() {
  const { userRole, userName, logout, isTokenExpired } = useAuth();
  const { resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDarkMode = resolvedTheme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted || isTokenExpired || !userRole) return null;

  const dropdownItems = [
    {
      label: userRole === 'admin' ? 'Admin Dashboard' : 'Dashboard',
      href: userRole === 'admin' ? '/admin-dashboard' : '/user-dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    { label: 'Profile', href: '/profile', icon: <User size={18} /> },
    { label: 'Edit Profile', href: '/profile/edit-profile', icon: <Settings size={18} /> },
    { label: 'Logout', href: '#', icon: <LogOut size={18} />, onClick: logout },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Mobile View - Small Circle Avatar */}
      <div className="block sm:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700 focus:ring-offset-gray-900'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 focus:ring-offset-white'
          } ${isOpen ? 'ring-2 ring-indigo-500' : ''}`}
          aria-label="User profile menu"
          aria-expanded={isOpen}
        >
          <span className="text-xs font-bold">
            {getInitials(userName || 'User')}
          </span>
        </button>
      </div>

      {/* Desktop View - Full Button */}
      <div className="hidden sm:block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 group ${
            isDarkMode
              ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white hover:from-gray-700 hover:to-gray-600 focus:ring-offset-gray-900'
              : 'bg-gradient-to-r from-white to-gray-50 text-gray-900 hover:from-gray-50 hover:to-gray-100 border border-gray-200 hover:border-gray-300 focus:ring-offset-white'
          } ${isOpen ? 'ring-2 ring-indigo-500' : ''}`}
          aria-label="User profile menu"
          aria-expanded={isOpen}
        >
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
            isDarkMode
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
          }`}>
            {getInitials(userName || 'User')}
          </div>
          <span className="truncate max-w-[120px] md:max-w-[150px]">
            {userName || 'User'}
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-56 sm:w-64 rounded-xl shadow-2xl border backdrop-blur-md py-2 z-50 transform transition-all duration-200 origin-top-right ${
            isDarkMode
              ? 'bg-gray-800/95 border-gray-700 text-white'
              : 'bg-white/95 border-gray-200 text-gray-900'
          }`}
          style={{
            animation: isOpen ? 'dropdownOpen 0.2s ease-out' : 'dropdownClose 0.2s ease-in',
          }}
        >
          {/* User Info Header */}
          <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                isDarkMode
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
              }`}>
                {getInitials(userName || 'User')}
              </div>
              <div>
                <p className="font-semibold text-sm truncate max-w-[150px]">
                  {userName || 'User'}
                </p>
                <p className={`text-xs capitalize ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {userRole}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {dropdownItems.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-150 ${
                  item.label === 'Logout'
                    ? isDarkMode
                      ? 'hover:bg-red-900/20 hover:text-red-400'
                      : 'hover:bg-red-50 hover:text-red-600'
                    : isDarkMode
                    ? 'hover:bg-indigo-900/20 hover:text-indigo-400'
                    : 'hover:bg-indigo-50 hover:text-indigo-600'
                } ${index === dropdownItems.length - 1 ? 'border-t border-gray-200 dark:border-gray-700 mt-1' : ''}`}
              >
                <span className={`${item.label === 'Logout' ? 'text-red-500' : ''}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes dropdownOpen {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes dropdownClose {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}