"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface StaffMember {
  name: string;
  role: string;
  education: string;
  expertise: string;
}

const Page = () => {
  const [staff] = useState<StaffMember[]>([
    {
      name: "Dr. Noormast",
      role: "Professor",
      education: "PhD in Computer Science",
      expertise: "Web Development, Networking Expert",
    },
    {
      name: "Dr. Samina",
      role: "Associate Professor",
      education: "PhD in Artificial Intelligence",
      expertise: "AI and Machine Learning",
    },
    {
      name: "Mr. Faisal Baseer",
      role: "Project Manager",
      education: "MBA",
      expertise: "Software Project Management",
    },
    {
      name: "Dr. Abrar",
      role: "Senior Lecturer",
      education: "PhD in Computer Engineering",
      expertise: "Assembly Language, Operating System",
    },
    {
      name: "Ms. Zara Ahmed",
      role: "Research Fellow",
      education: "MPhil in Data Science, COMSATS, Islamabad",
      expertise: "Data Analytics, Cloud Computing",
    },
    {
      name: "Mr. Omar Farooq",
      role: "Systems Architect",
      education: "BSc Engineering, UET Lahore",
      expertise: "System Design, Cybersecurity",
    },
  ]);

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
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
      <div className="w-full max-w-4xl mb-6 sm:mb-12">
        <h2 className={`text-2xl sm:text-3xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"} text-center`}>Our Expert Faculty</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {staff.map((member) => (
            <div
              key={member.name}
              className={`p-4 sm:p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 ${isDarkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-50"} border`}
            >
              <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{member.name}</h3>
              <p className={`mt-1 sm:mt-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{member.role}</p>
              <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"} text-xs sm:text-sm`}>Education: {member.education}</p>
              <p className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"} text-xs sm:text-sm`}>Expertise: {member.expertise}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;