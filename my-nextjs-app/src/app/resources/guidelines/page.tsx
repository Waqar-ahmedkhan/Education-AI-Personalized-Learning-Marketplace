"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useState } from "react";

interface Guideline {
  title: string;
  description: string;
  icon: string;
}

const Page = () => {
  const guidelines: Guideline[] = [
    { title: "Code Quality Standards", description: "Standards for maintaining high-quality, readable code.", icon: "code" },
    { title: "Best Practices", description: "Recommended approaches for efficient and maintainable development.", icon: "star" },
    { title: "Testing Requirements", description: "Guidelines for comprehensive testing of your code.", icon: "check" },
    { title: "Security Guidelines", description: "Essential security practices for protecting your application.", icon: "shield" },
    { title: "Performance Standards", description: "Requirements for ensuring optimal application performance.", icon: "gauge" },
    { title: "Documentation Requirements", description: "Standards for thorough documentation of your project.", icon: "book" },
  ];

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
        <h1 className={`text-3xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Guidelines</h1>
        <p className={`text-md ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Follow these guidelines to ensure high-quality, maintainable, and secure code across all projects.
        </p>
      </div>
      <div className="w-full max-w-4xl">
        {guidelines.map((guideline, index) => (
          <div
            key={index}
            className={`mb-4 p-6 rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border flex items-center`}
          >
            <span className={`mr-4 text-2xl ${guideline.icon === "code" ? "text-blue-400" : guideline.icon === "star" ? "text-yellow-400" : guideline.icon === "check" ? "text-green-400" : guideline.icon === "shield" ? "text-purple-400" : guideline.icon === "gauge" ? "text-red-400" : "text-orange-400"}`}>
              {guideline.icon === "code" ? "💻" : guideline.icon === "star" ? "⭐" : guideline.icon === "check" ? "✅" : guideline.icon === "shield" ? "🛡️" : guideline.icon === "gauge" ? "📊" : "📖"}
            </span>
            <div>
              <h3 className={`text-xl font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{guideline.title}</h3>
              <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{guideline.description}</p>
            </div>
          </div>
        ))}
        <p className={`text-md mt-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          These guidelines are regularly updated. Check back frequently for the latest best practices.
        </p>
      </div>
    </div>
  );
};

export default Page;

