"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface Discussion {
  title: string;
  content: string;
  upvotes: number;
}

const Page = () => {
  const [discussions] = useState<Discussion[]>([
    {
      title: "Best Practices for MERN Stack Development",
      content: "Sharing tips and tricks for efficient MERN stack projects.",
      upvotes: 150,
    },
    {
      title: "Security Concerns in E-commerce Apps",
      content: "Discussing common security pitfalls and solutions.",
      upvotes: 75,
    },
  ]);

  const community = [
    { name: "John Doe", role: "Developer" },
    { name: "Jane Smith", role: "Designer" },
  ];

  const staff = [
    { name: "Alice Johnson", role: "Senior Developer" },
    { name: "Bob Brown", role: "Project Manager" },
  ];

  const decisions = [
    { topic: "Adopt TypeScript for All Projects", decision: "Approved by majority vote on June 10, 2025" },
    { topic: "Implement CI/CD Pipeline", decision: "Pending further review" },
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
        <h2 className={`text-3xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Discussions</h2>
        <div className="grid grid-cols-1 gap-6">
          {discussions.map((discussion, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl shadow-lg ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border`}
            >
              <h3 className={`text-xl font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{discussion.title}</h3>
              <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{discussion.content}</p>
              <span className={`mt-4 inline-block ${isDarkMode ? "text-green-400" : "text-green-600"}`}>{discussion.upvotes} 👍</span>
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
      <div className="w-full max-w-4xl mb-12">
        <h2 className={`text-3xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Staff</h2>
        <div className="space-y-4">
          {staff.map((member, index) => (
            <div key={index} className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
              {member.name} - {member.role}
            </div>
          ))}
        </div>
      </div>
      <div className="w-full max-w-4xl">
        <h2 className={`text-3xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Decisions</h2>
        <div className="space-y-4">
          {decisions.map((decision, index) => (
            <div key={index} className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
              <h3 className={`text-lg font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{decision.topic}</h3>
              <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{decision.decision}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;