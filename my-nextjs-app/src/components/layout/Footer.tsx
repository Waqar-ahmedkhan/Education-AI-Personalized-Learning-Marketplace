"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Send,
  MapPin,
  Phone,
  ChevronUp,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Footer() {
  const { resolvedTheme } = useTheme();
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");

  const isDarkMode = resolvedTheme === "dark";

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEmailError("");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (email && /\S+@\S+\.\S+/.test(email)) {
      toast.success("Subscribed!", {
        description: "Thank you for joining our newsletter!",
      });
      setEmail("");
    } else {
      setEmailError("Please enter a valid email address.");
      toast.error("Error", {
        description: "Please enter a valid email address.",
      });
    }
    setIsSubmitting(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = useMemo(
    () => [
      { icon: Facebook, href: "https://facebook.com", label: "Facebook", color: "hover:text-blue-400" },
      { icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:text-sky-400" },
      { icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "hover:text-pink-400" },
      { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", color: "hover:text-blue-600" },
      { icon: Youtube, href: "https://youtube.com", label: "YouTube", color: "hover:text-red-400" },
    ],
    []
  );

  const quickLinks = useMemo(
    () => [
      { name: "About Us", href: "/about" },
      { name: "Courses", href: "/courses" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
    []
  );

  const resourcesLinks = useMemo(
    () => [
      { name: "Documentation", href: "/docs" },
      { name: "Guides", href: "/guides" },
      { name: "Webinars", href: "/webinars" },
      { name: "Support", href: "/support" },
    ],
    []
  );

  const legalLinks = useMemo(
    () => [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "Site Map", href: "/sitemap" },
    ],
    []
  );

  const staffMembers = useMemo(
    () => [
      {
        name: "Waqar Ahmed",
        role: "Full Stack DevOps Engineer & AI Specialist",
        image: "/waqar.jpeg",
        bio: "Expert in AI and Machine Learning",
        profile: "/profile/waqar",
      },
      {
        name: "Hammad Qureshi",
        role: "Full Stack Developer",
        image: "/hammad.jpeg",
        bio: "Specialist in educational content",
        profile: "/profile/hammad",
      },
    ],
    []
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.footer
      className={`${
        isDarkMode
          ? "bg-gradient-to-b from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-b from-white to-gray-100 text-gray-900"
      } transition-colors duration-300 backdrop-blur-md relative`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-7xl">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <motion.div variants={itemVariants} className="space-y-6 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3" aria-label="EduAI Home">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/10 p-1">
                <Image
                  src="/logo.png"
                  alt="EduAI Logo"
                  fill
                  className="object-contain"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/48?text=Logo";
                  }}
                />
              </div>
              <h2
                className={`text-3xl font-bold bg-clip-text text-transparent ${
                  isDarkMode
                    ? "bg-gradient-to-r from-white to-indigo-400"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600"
                }`}
              >
                EduAI
              </h2>
            </Link>
            <p
              className={`${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              } leading-relaxed max-w-md text-base`}
            >
              Empowering the next generation with AI-driven education solutions. Join our community to learn, grow, and succeed.
            </p>
            <TooltipProvider>
              <div className="flex gap-4 pt-2">
                {socialLinks.map(({ icon: Icon, href, label, color }) => (
                  <Tooltip key={label}>
                    <TooltipTrigger asChild>
                      <motion.a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -4, scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        } ${color} transition-colors duration-200`}
                        aria-label={label}
                      >
                        <Icon className="h-6 w-6" />
                      </motion.a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3
              className={`text-xl font-semibold flex items-center gap-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <span className="w-3 h-3 bg-indigo-400 rounded-full"></span>
              Navigation
            </h3>
            <ul className="space-y-4">
              {quickLinks.map(({ name, href }) => (
                <motion.li
                  key={name}
                  whileHover={{ x: 8, scale: 1.05 }}
                  className={`${
                    isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-indigo-600"
                  } transition-all duration-200`}
                >
                  <Link href={href} className="flex items-center gap-2 text-base" aria-label={name}>
                    <span className="text-indigo-400">↳</span>
                    {name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3
              className={`text-xl font-semibold flex items-center gap-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <span className="w-3 h-3 bg-indigo-400 rounded-full"></span>
              Resources
            </h3>
            <ul className="space-y-4">
              {resourcesLinks.map(({ name, href }) => (
                <motion.li
                  key={name}
                  whileHover={{ x: 8, scale: 1.05 }}
                  className={`${
                    isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-indigo-600"
                  } transition-all duration-200`}
                >
                  <Link href={href} className="flex items-center gap-2 text-base" aria-label={name}>
                    <span className="text-indigo-400">↳</span>
                    {name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Team Highlights */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3
              className={`text-xl font-semibold flex items-center gap-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <span className="w-3 h-3 bg-indigo-400 rounded-full"></span>
              Our Team
            </h3>
            <div className="space-y-4 w-full">
              {staffMembers.map(({ name, role, image, bio, profile }) => (
                <motion.div
                  key={name}
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center gap-4 p-2 bg-white/10 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-indigo-400/50">
                    <Image
                      src={image}
                      alt={`${name}'s profile picture`}
                      fill
                      className="object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/56?text=Avatar";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={profile}
                      className={`${
                        isDarkMode ? "text-gray-200 hover:text-white" : "text-gray-700 hover:text-indigo-600"
                      } font-semibold text-base`}
                      aria-label={`View ${name}'s profile`}
                    >
                      {name}
                    </Link>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {role} • {bio}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${
                      isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-indigo-600"
                    } rounded-full h-10 w-10`}
                    aria-label={`Chat with ${name}`}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Newsletter & Contact */}
          <motion.div variants={itemVariants} className="space-y-6 lg:col-span-1">
            <div className="space-y-4">
              <h3
                className={`text-xl font-semibold flex items-center gap-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <span className="w-3 h-3 bg-indigo-400 rounded-full"></span>
                Newsletter
              </h3>
              <p
                className={`${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                } text-base`}
              >
                Subscribe for the latest updates and exclusive course offerings.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    className={`${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } focus:ring-2 focus:ring-indigo-400 pl-4 pr-12 py-3 rounded-lg transition-all duration-200 ${
                      emailError ? "border-red-500" : ""
                    }`}
                    disabled={isSubmitting}
                    aria-label="Newsletter email input"
                  />
                  {emailError && (
                    <p className="text-red-500 text-xs mt-1">{emailError}</p>
                  )}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 ${
                      isDarkMode
                        ? "bg-indigo-600 hover:bg-indigo-500"
                        : "bg-indigo-500 hover:bg-indigo-600"
                    } text-white h-9 w-9 p-0 rounded-full transition-colors duration-200`}
                    aria-label="Submit newsletter subscription"
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Send className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </form>
            </div>

            <div className="space-y-4 pt-6">
              <h3
                className={`text-xl font-semibold flex items-center gap-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <span className="w-3 h-3 bg-indigo-400 rounded-full"></span>
                Contact
              </h3>
              <ul
                className={`space-y-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                } text-base`}
              >
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>support@eduplatform.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>123 Education Lane, Knowledge City, ED 12345</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          className={`mt-12 pt-8 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          } flex flex-col sm:flex-row justify-between items-center gap-6`}
        >
          <p
            className={`text-sm text-center sm:text-left ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            © {new Date().getFullYear()} EduAI. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {legalLinks.map(({ name, href }) => (
              <motion.div
                key={name}
                whileHover={{ y: -3, scale: 1.05 }}
                className={`text-sm ${
                  isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-indigo-600"
                } transition-all duration-200`}
              >
                <Link href={href} aria-label={name}>
                  {name}
                </Link>
              </motion.div>
            ))}
          </div>
          <Button
            onClick={scrollToTop}
            className={`${
              isDarkMode
                ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
            } rounded-full p-3 transition-colors duration-200`}
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>
    </motion.footer>
  );
}