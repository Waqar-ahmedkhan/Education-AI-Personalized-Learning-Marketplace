"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Page = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", message: "" });
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
      <div className="w-full max-w-4xl mb-6 sm:mb-12">
        <h2 className={`text-2xl sm:text-3xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"} text-center`}>Get in Touch</h2>
        <div className={`p-4 sm:p-6 rounded-xl shadow-lg ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>Contact Information</h3>
              <p className={`mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"} text-sm sm:text-base`}>Email: <a href="mailto:support@resourceshub.com" className="text-indigo-500 hover:underline">support@resourceshub.com</a></p>
              <p className={`mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"} text-sm sm:text-base`}>Email: <a href="mailto:info@resourceshub.com" className="text-indigo-500 hover:underline">info@resourceshub.com</a></p>
              <p className={`mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"} text-sm sm:text-base`}>Phone: <a href="tel:+923001234567" className="text-indigo-500 hover:underline">+92-300-1234567</a></p>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} text-sm sm:text-base`}>Address: 123 Tech Avenue, Lahore, Pakistan</p>
            </div>
            <div>
              <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>Business Hours</h3>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} text-sm sm:text-base`}>Monday - Friday: 9:00 AM - 6:00 PM PKT</p>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} text-sm sm:text-base`}>Saturday: 10:00 AM - 2:00 PM PKT</p>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} text-sm sm:text-base`}>Sunday: Closed</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Full Name"
              className={`w-full p-2 sm:p-3 rounded-lg ${isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} border text-sm sm:text-base`}
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email Address"
              className={`w-full p-2 sm:p-3 rounded-lg ${isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} border text-sm sm:text-base`}
              required
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              className={`w-full p-2 sm:p-3 rounded-lg ${isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} border h-24 text-sm sm:text-base`}
              required
            />
            <button
              type="submit"
              className={`w-full px-4 py-2 sm:px-6 sm:py-3 rounded-full ${isDarkMode ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-indigo-600 text-white hover:bg-indigo-700"} text-sm sm:text-base`}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;