"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface Project {
  title: string;
  description: string;
  stars: number;
}

const Page = () => {
  const [projects] = useState<Project[]>([
    {
      title: "All Functional MERN Stack LMS Learning Management system series with next 13, TypeScript | Full Course",
      description: "A comprehensive learning management system built with MERN stack.",
      stars: 4300,
    },
    {
      title: "Multi-Vendor MERN Stack E-commerce project With All functionalities absolutely for beginners",
      description: "An e-commerce solution for beginners using MERN stack.",
      stars: 400,
    },
  ]);

  const community = [
    { name: "John Doe", role: "Developer" },
    { name: "Jane Smith", role: "Designer" },
  ];

  const navLinks = [
    { name: "Source Code", href: "/resources/source-code" },
    { name: "Discussions", href: "/resources/discussions" },
    { name: "Guidelines", href: "/resources/guidelines" },
    { name: "Blogs", href: "/blogs" },
  ];

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
      <div className="w-full max-w-4xl mb-12">
        <h2 className={`text-3xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Source Code</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl shadow-lg ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border`}
            >
              <h3 className={`text-xl font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{project.title}</h3>
              <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{project.description}</p>
              <span className={`mt-4 inline-block ${isDarkMode ? "text-green-400" : "text-green-600"}`}>{project.stars} ★</span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full max-w-4xl mb-12">
        <h2 className={`text-3xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Community</h2>
        <div className="space-y-4">
          {community.map((member, index) => (
            <div key={index} className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
              {member.name} - {member.role}
            </div>
          ))}
        </div>
      </div>
      <div className="w-full max-w-4xl">
        <h2 className={`text-3xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Staff</h2>
        <div className="space-y-4">
          {community.map((member, index) => (
            <div key={index} className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
              {member.name} - {member.role}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;