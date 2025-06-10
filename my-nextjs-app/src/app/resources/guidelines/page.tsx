"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Resources", href: "/resources" },
    { name: "Guidelines", href: "/resources/guidelines" },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDarkMode = resolvedTheme === "dark";

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
    <div className={`min-h-screen ${isDarkMode ? `bg-gradient-to-b from-[#121e4a] to-black text-white` : `bg-gradient-to-b from-[#121e4a]/20 to-white text-gray-900`} flex flex-col items-center justify-start p-6`}>
      <nav className="w-full max-w-4xl mb-12">
        <div className="flex justify-center space-x-6">
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isDarkMode ? "text-purple-300 hover:bg-purple-900 hover:text-white" : "text-indigo-600 hover:bg-indigo-100"}`}
            >
              {link.name}
            </a>
          ))}
        </div>
      </nav>
      <div className="w-full max-w-4xl text-center mb-12">
        <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? "bg-gradient-to-r from-purple-300 to-indigo-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"}`}>
          Development Guidelines
        </h1>
        <p className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          Follow these guidelines to ensure high-quality, maintainable, and secure code across all projects.
        </p>
      </div>
      <div className="w-full max-w-4xl">
        {guidelines.map((guideline, index) => (
          <div
            key={index}
            className={`mb-4 p-6 rounded-xl shadow-lg ${isDarkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-100"} border cursor-pointer transition-colors`}
            onClick={() => toggleSection(guideline.title)}
          >
            <div className="flex items-center">
              <span className={`mr-4 text-2xl ${guideline.icon === "code" ? "text-blue-400" : guideline.icon === "star" ? "text-yellow-400" : guideline.icon === "check" ? "text-green-400" : guideline.icon === "shield" ? "text-purple-400" : guideline.icon === "gauge" ? "text-red-400" : "text-orange-400"}`}>
                {guideline.icon === "code" ? "💻" : guideline.icon === "star" ? "⭐" : guideline.icon === "check" ? "✅" : guideline.icon === "shield" ? "🛡️" : guideline.icon === "gauge" ? "📊" : "📖"}
              </span>
              <div className="flex-1">
                <h3 className={`text-xl font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{guideline.title}</h3>
              </div>
              <span className={`text-xl ${openSections.has(guideline.title) ? "text-gray-400" : "text-gray-600"}`}>
                {openSections.has(guideline.title) ? "▼" : "▶"}
              </span>
            </div>
            {openSections.has(guideline.title) && (
              <p className={`mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{guideline.description}</p>
            )}
          </div>
        ))}
        <p className={`text-md mt-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          These guidelines were last updated on 05:59 PM, June 10, 2025. Check back frequently for the latest best practices.
        </p>
      </div>
    </div>
  );
};

export default Page;