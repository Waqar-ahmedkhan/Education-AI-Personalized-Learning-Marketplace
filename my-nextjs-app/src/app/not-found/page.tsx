'use client';

import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  const { theme, systemTheme } = useTheme();

  const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className={`min-h-screen p-6 bg-gradient-to-br ${isDark ? 'from-gray-900 via-indigo-900 to-purple-900' : 'from-gray-100 via-indigo-200 to-purple-200'} flex items-center justify-center`}
    >
      <motion.div
        className="container mx-auto max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className={`backdrop-blur-lg ${isDark ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/70 border-gray-200/50'}`}>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">404 - Page Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div variants={itemVariants}>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Sorry, the page you’re looking for doesn’t exist or you don’t have access to it.
                </AlertDescription>
              </Alert>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center">
              <p className="text-muted-foreground">
                It looks like you’ve wandered off the path. Let’s get you back home!
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="flex justify-center">
              <Link href="/">
                <Button className="w-full max-w-xs">
                  Back to Home
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}