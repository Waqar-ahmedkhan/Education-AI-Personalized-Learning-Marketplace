"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Discussion {
  title: string;
  content: string;
  upvotes: number;
}

interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

interface Member {
  name: string;
  role: string;
  type: "community" | "staff";
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

  const [messages, setMessages] = useState<Message[]>([
    { sender: "John Doe", content: "Hello everyone!", timestamp: "10:00 AM, Jul 18, 2025" },
    { sender: "Jane Smith", content: "Great topic! Any tips?", timestamp: "10:01 AM, Jul 18, 2025" },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [members] = useState<Member[]>([
    { name: "John Doe", role: "Developer", type: "community" },
    { name: "Jane Smith", role: "Designer", type: "community" },
    { name: "Alice Johnson", role: "Senior Developer", type: "staff" },
    { name: "Bob Brown", role: "Project Manager", type: "staff" },
  ]);

  const decisions = [
    { topic: "Adopt TypeScript for All Projects", decision: "Approved by majority vote on Jul 18, 2025" },
    { topic: "Implement CI/CD Pipeline", decision: "Pending further review" },
  ];

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { sender: "You", content: newMessage, timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) + ", " + new Date().toLocaleDateString() }]);
      setNewMessage("");
    }
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
        <h2 className={`text-2xl sm:text-3xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Discussions</h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {discussions.map((discussion) => (
            <div
              key={discussion.title}
              className={`p-4 sm:p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 ${isDarkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-100"} border`}
            >
              <h3 className={`text-lg sm:text-xl font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{discussion.title}</h3>
              <p className={`mt-1 sm:mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"} text-sm sm:text-base`}>{discussion.content}</p>
              <span className={`mt-2 sm:mt-4 inline-block ${isDarkMode ? "text-green-400" : "text-green-600"} text-sm sm:text-base`}>{discussion.upvotes} 👍</span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full max-w-4xl mb-6 sm:mb-12">
        <h2 className={`text-2xl sm:text-3xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Chat</h2>
        <div className={`p-4 sm:p-6 rounded-xl shadow-lg ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border mb-4 sm:mb-6 h-40 sm:h-64 overflow-y-auto`}>
          {messages.map((msg) => (
            <div key={msg.timestamp} className={`mb-2 ${msg.sender === "You" ? "text-right" : "text-left"}`}>
              <span className={`inline-block p-2 sm:p-3 rounded-lg ${isDarkMode ? "bg-purple-700 text-white" : "bg-indigo-200 text-gray-800"} text-sm sm:text-base`}>{msg.content}</span>
              <p className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{msg.sender} - {msg.timestamp}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className={`w-full p-2 sm:p-3 rounded-lg ${isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"} border text-sm sm:text-base`}
          />
          <button
            type="submit"
            className={`w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 rounded-full ${isDarkMode ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-indigo-600 text-white hover:bg-indigo-700"} text-sm sm:text-base`}
          >
            Send
          </button>
        </form>
      </div>
      <div className="w-full max-w-4xl mb-6 sm:mb-12">
        <h2 className={`text-2xl sm:text-3xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Community</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {members.filter(member => member.type === "community").map((member) => (
            <div
              key={member.name}
              className={`p-4 sm:p-6 rounded-xl shadow-lg ${isDarkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-100"} border`}
            >
              <p className={`text-lg sm:text-xl ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{member.name} - {member.role}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full max-w-4xl mb-6 sm:mb-12">
        <h2 className={`text-2xl sm:text-3xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Staff</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {members.filter(member => member.type === "staff").map((member) => (
            <div
              key={member.name}
              className={`p-4 sm:p-6 rounded-xl shadow-lg ${isDarkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-100"} border`}
            >
              <p className={`text-lg sm:text-xl ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{member.name} - {member.role}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full max-w-4xl">
        <h2 className={`text-2xl sm:text-3xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Decisions</h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {decisions.map((decision) => (
            <div
              key={decision.topic}
              className={`p-4 sm:p-6 rounded-xl shadow-lg ${isDarkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-white border-gray-200 hover:bg-gray-100"} border`}
            >
              <h3 className={`text-lg sm:text-xl font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{decision.topic}</h3>
              <p className={`mt-1 sm:mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"} text-sm sm:text-base`}>{decision.decision}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;