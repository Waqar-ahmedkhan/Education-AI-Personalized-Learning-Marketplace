import { Inter } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/core/ThemeProvider";
import { AuthProvider } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { GoogleOAuthProvider } from "@react-oauth/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "My Next.js 15 App",
  description: "A modern Next.js app with shadcn/ui and Tailwind CSS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
         <GoogleOAuthProvider clientId="84827681779-b8al43fq2e9v54vbcqieo56o6qsos8d6.apps.googleusercontent.com">

            
            <AuthProvider>
              <Navbar />
              {children}
              <Footer />
            </AuthProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
