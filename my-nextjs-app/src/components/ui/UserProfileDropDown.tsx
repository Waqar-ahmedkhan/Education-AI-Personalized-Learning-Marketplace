'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { User, Settings, LogOut, LayoutDashboard } from 'lucide-react';

export default function UserProfileDropdown() {
  const { userRole, userName, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const isDarkMode = resolvedTheme === 'dark';

  if (!userRole) return null;

  const dropdownItems = [
    {
      label: userRole === 'admin' ? 'Admin Dashboard' : 'Dashboard',
      href: userRole === 'admin' ? '/admin-dashboard' : '/user-dashboard',
      icon: <LayoutDashboard size={16} />,
    },
    { label: 'Profile', href: '/profile', icon: <User size={16} /> },
    { label: 'Edit Profile', href: '/edit-profile', icon: <Settings size={16} /> },
    { label: 'Logout', href: '#', icon: <LogOut size={16} />, onClick: logout },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          isDarkMode
            ? 'bg-gray-800 text-white hover:bg-gray-700'
            : 'bg-white text-gray-900 hover:bg-gray-100'
        }`}
        aria-label="User profile menu"
        aria-expanded={isOpen}
      >
        <span>{userName || 'User'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl border py-2 ${
            isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          {dropdownItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                  setIsOpen(false);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-colors`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}