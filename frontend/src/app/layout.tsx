import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "../components/layout/LayoutWrapper";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Chapter | AI-Powered Personal Study Tracker",
  description: "Next Chapter is a premium study dashboard. Plan subjects, schedule reviews using spaced repetition, complete lessons, practice with AI quiz generation, and visualize knowledge nodes.",
  keywords: ["Learning tracker", "AI study assistant", "spaced repetition", "knowledge graph", "study OS", "Notion for learning"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning={true}>
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster position="top-right" theme="system" richColors closeButton />
      </body>
    </html>
  );
}
