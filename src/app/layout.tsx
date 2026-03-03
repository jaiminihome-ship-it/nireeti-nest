import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SettingsProvider } from "@/components/providers/SettingsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Nireeti Nest - Premium Home Decor & Essentials",
  description: "Discover curated home decor and essentials at The Nireeti Nest. Quality craftsmanship meets modern design for your perfect living space.",
  keywords: ["Home Decor", "Interior Design", "Furniture", "Living Room", "Bedroom", "Modern Design"],
  authors: [{ name: "The Nireeti Nest Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "The Nireeti Nest - Premium Home Decor & Essentials",
    description: "Discover curated home decor and essentials at The Nireeti Nest. Quality craftsmanship meets modern design for your perfect living space.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SettingsProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  );
}
