"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState } from "react";

const Page = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDarkMode = resolvedTheme === "dark";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Resources", href: "/resources" },
    { name: "Contact", href: "/contact" },
  ];

  const subPages = [
    { name: "Source Code", href: "/resources/source-code", icon: "💻" },
    { name: "Discussions", href: "/resources/discussions", icon: "💬" },
    { name: "Guidelines", href: "/resources/guidelines", icon: "📚" },
  ];

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
        <h1 className={`text-5xl font-bold mb-4 ${isDarkMode ? "bg-gradient-to-r from-purple-300 to-indigo-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"}`}>
          Resources Hub
        </h1>
        <p className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          Explore tools, discussions, and guidelines for your projects.
        </p>
      </div>
      <div className="w-full max-w-4xl">
        <h2 className={`text-3xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Available Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subPages.map((page, index) => (
            <Link href={page.href} key={index} className={`block p-6 rounded-xl shadow-lg ${isDarkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-100"} border text-center transition-colors`}>
              <span className={`text-3xl mb-2 block ${isDarkMode ? "text-purple-300" : "text-indigo-600"}`}>{page.icon}</span>
              <h3 className={`text-xl font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{page.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;