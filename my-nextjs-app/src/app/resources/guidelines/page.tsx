"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Guideline {
  title: string;
  description: string;
  icon: string;
}

const Page = () => {
  const guidelines: Guideline[] = [
    { title: "Code Quality Standards", description: "Standards for maintaining high-quality, readable, and maintainable code.", icon: "code" },
    { title: "Best Practices", description: "Recommended approaches for efficient, scalable, and maintainable development.", icon: "star" },
    { title: "Testing Requirements", description: "Guidelines for comprehensive unit, integration, and end-to-end testing of your code.", icon: "check" },
    { title: "Security Guidelines", description: "Essential security practices including encryption and access control for protecting your application.", icon: "shield" },
    { title: "Performance Standards", description: "Requirements for optimizing load times and ensuring scalable application performance.", icon: "gauge" },
    { title: "Documentation Requirements", description: "Standards for creating detailed, accessible, and up-to-date project documentation.", icon: "book" },
  ];

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDarkMode = resolvedTheme === "dark";

  const navLinks = [
    { name: "Resources", href: "/resources" },
    { name: "Source Code", href: "/resources/source-code" },
    { name: "Discussions", href: "/resources/discussions" },
    { name: "Guidelines", href: "/resources/guidelines" },
    { name: "Staff", href: "/resources/staff" },
    { name: "Blogs", href: "/resources/blogs" },
    { name: "Contact", href: "/resources/contact" },
  ];

  const toggleSection = (title: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(title)) {
      newOpenSections.delete(title);
    } else {
      newOpenSections.add(title);
    }
    setOpenSections(newOpenSections);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? `bg-gradient-to-b from-[#121e4a] to-black text-white` : `bg-gradient-to-b from-[#121e4a]/20 to-white text-gray-900`} flex flex-col items-center p-4 sm:p-6`}>
      <nav className="w-full max-w-4xl sticky top-0 bg-opacity-90 backdrop-blur-md z-10 mb-6 sm:mb-12">
        <div className="flex justify-between items-center px-4 py-2 sm:px-0 sm:py-4">
          <button
            className="sm:hidden text-2xl focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
          <div className={`flex-col sm:flex-row ${isMenuOpen ? "flex" : "hidden"} sm:flex w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-6`}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${pathname === link.href ? (isDarkMode ? "bg-purple-600 text-white" : "bg-indigo-600 text-white") : (isDarkMode ? "text-purple-300 hover:bg-purple-900 hover:text-white" : "text-indigo-600 hover:bg-indigo-100")} sm:inline-block`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <div className="w-full max-w-4xl text-center mb-6 sm:mb-12">
        <h1 className={`text-2xl sm:text-4xl font-bold mb-4 ${isDarkMode ? "bg-gradient-to-r from-purple-300 to-indigo-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"}`}>
          Development Guidelines
        </h1>
        <p className={`text-sm sm:text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"} max-w-xs sm:max-w-xl mx-auto leading-relaxed`}>
          Follow these guidelines to ensure high-quality, maintainable, and secure code across all projects.
        </p>
      </div>
      <div className="w-full max-w-4xl">
        {guidelines.map((guideline) => (
          <div
            key={guideline.title}
            className={`mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 ${isDarkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-50"} border cursor-pointer`}
            onClick={() => toggleSection(guideline.title)}
          >
            <div className="flex items-center">
              <span className={`mr-2 sm:mr-4 text-xl sm:text-2xl ${guideline.icon === "code" ? "text-blue-400" : guideline.icon === "star" ? "text-yellow-400" : guideline.icon === "check" ? "text-green-400" : guideline.icon === "shield" ? "text-purple-400" : guideline.icon === "gauge" ? "text-red-400" : "text-orange-400"}`}>
                {guideline.icon === "code" ? "💻" : guideline.icon === "star" ? "⭐" : guideline.icon === "check" ? "✅" : guideline.icon === "shield" ? "🛡️" : guideline.icon === "gauge" ? "📊" : "📖"}
              </span>
              <div className="flex-1">
                <h3 className={`text-lg sm:text-xl font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{guideline.title}</h3>
              </div>
              <span className={`text-lg sm:text-xl ${openSections.has(guideline.title) ? "text-gray-400" : "text-gray-600"} transition-transform duration-300 ${openSections.has(guideline.title) ? "rotate-180" : ""}`}>
                ▼
              </span>
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${openSections.has(guideline.title) ? "max-h-96" : "max-h-0"}`}>
              {openSections.has(guideline.title) && (
                <p className={`mt-2 sm:mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"} text-sm sm:text-base`}>{guideline.description}</p>
              )}
            </div>
          </div>
        ))}
        <p className={`text-xs sm:text-md mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          These guidelines were last updated on 05:59 PM, Jun 10, 2025. Check back frequently for the latest best practices.
        </p>
      </div>
    </div>
  );
};

export default Page;