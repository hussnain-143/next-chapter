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
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3000,
            className: 'border border-border/50 bg-background/90 backdrop-blur-xl shadow-2xl rounded-2xl p-4',
            classNames: {
              toast: 'group',
              title: 'text-foreground font-bold text-[14px]',
              description: 'text-muted-foreground text-[13px] font-medium mt-1',
              actionButton: 'bg-primary text-primary-foreground font-bold rounded-lg',
              cancelButton: 'bg-muted text-muted-foreground font-bold rounded-lg',
              success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600',
              error: 'border-rose-500/30 bg-rose-500/10 text-rose-600',
              icon: 'mr-3',
            }
          }} 
        />
      </body>
    </html>
  );
}
