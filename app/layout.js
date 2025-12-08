import { Inter } from "next/font/google";
import "./globals.css";
// 1. Import the ThemeProvider and UserProvider
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kampo Mido Jewellers",
  description: "Admin Management System",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 2. ThemeProvider and UserProvider MUST wrap LayoutWrapper */}
        <ThemeProvider>
          <UserProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}