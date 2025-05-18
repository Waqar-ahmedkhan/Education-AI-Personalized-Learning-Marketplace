"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (email && /\S+@\S+\.\S+/.test(email)) {
      toast.success("Subscribed!", {
        description: "Thank you for joining our newsletter!",
      });
      setEmail("");
    } else {
      toast.error("Error", {
        description: "Please enter a valid email address.",
      });
    }
    setIsSubmitting(false);
  };

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  ];

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Courses", href: "/courses" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ];

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
      className="bg-gradient-to-b from-gray-900 to-black text-white"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              EduPlatform
            </Link>
            <p className="text-sm text-gray-300 max-w-xs">
              Empowering minds through world-class education. Join our community to learn, grow, and succeed.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map(({ name, href }) => (
                <motion.li
                  key={name}
                  whileHover={{ x: 5 }}
                  className="text-sm text-gray-300 hover:text-white"
                >
                  <Link href={href}>{name}</Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold">Newsletter</h3>
            <p className="text-sm text-gray-300">
              Stay updated with our latest courses and news.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-black hover:bg-gray-200"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@eduplatform.com</span>
              </li>
              <li>123 Education Lane</li>
              <li>Knowledge City, ED 12345</li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-sm text-gray-300">
            © {new Date().getFullYear()} EduPlatform. All rights reserved.
          </p>
          <ul className="flex space-x-4 mt-4 md:mt-0">
            {legalLinks.map(({ name, href }) => (
              <motion.li
                key={name}
                whileHover={{ y: -2 }}
                className="text-sm text-gray-300 hover:text-white"
              >
                <Link href={href}>{name}</Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.footer>
  );
}