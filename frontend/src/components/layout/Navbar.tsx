"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Home,
  Info,
  BookOpen,
  Folder,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import UserProfileDropdown from "@/components/ui/UserProfileDropDown";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: <Home size={20} /> },
  { label: "About", href: "/about", icon: <Info size={20} /> },
  { label: "Courses", href: "/courses", icon: <BookOpen size={20} /> },
  { label: "Resources", href: "/resources", icon: <Folder size={20} /> },
];

export default function Navbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { userRole } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDarkMode = resolvedTheme === "dark";

  return (
    <>
      <nav
        className={`sticky  top-0 z-50 flex items-center justify-between px-6 py-3 sm:px-10 border-b shadow-sm backdrop-blur-md transition-colors ${
          isDarkMode
            ? "bg-gray-900 text-white border-gray-700"
            : "bg-white text-gray-900 border-gray-100"
        }`}
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="EduAI Home"
        >
          <Image
            src="/logo.png"
            alt="EduAI Logo"
            width={50}
            height={50}
            className="object-contain"
            priority
          />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Edu<span>AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-4 text-sm font-semibold">
          {navItems.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-3 py-2 rounded-lg transition duration-300 group ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : isDarkMode
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-full transition-transform origin-left duration-300 ${
                    isActive
                      ? "scale-x-100 bg-indigo-600"
                      : "scale-x-0 bg-indigo-600 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(isDarkMode ? "light" : "dark")}
            className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDarkMode
                ? "text-gray-300 hover:bg-gray-800"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {userRole ? (
            <UserProfileDropdown />
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg transition-colors"
              aria-label="Log in to EduAI"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      <nav
        className={`fixed bottom-0 left-0 z-50 flex justify-around items-center w-full py-3 px-4 border-t shadow-md backdrop-blur-md md:hidden transition-colors ${
          isDarkMode
            ? "bg-gray-900 text-white border-gray-700"
            : "bg-white text-gray-900 border-gray-100"
        }`}
        aria-label="Mobile navigation"
      >
        {navItems.map(({ label, href, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-transform duration-200 hover:scale-105 ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20"
                  : isDarkMode
                  ? "text-gray-400 hover:text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {icon}
              <span>{label}</span>
            </Link>
          );
        })}
        {userRole && (
          <Link
            href={userRole === "admin" ? "/admin-dashboard" : "/user-dashboard"}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-transform duration-200 hover:scale-105 ${
              pathname ===
              (userRole === "admin" ? "/admin-dashboard" : "/user-dashboard")
                ? "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20"
                : isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
            }`}
            aria-label="Dashboard"
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
        )}
      </nav>
    </>
  );
}
