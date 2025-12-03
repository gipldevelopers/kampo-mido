import { Inter } from "next/font/google";
import "./globals.css";
// 1. Import the ThemeProvider
import { ThemeProvider } from "@/context/ThemeContext";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kampo Mido Jewellers",
  description: "Admin Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 2. ThemeProvider MUST wrap LayoutWrapper so Navbar can access the theme */}
        <ThemeProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}