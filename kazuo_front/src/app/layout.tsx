import { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import ShowComponents from "../components/ShowComponents";
import Footer from "../components/Footer";
import { useRouter } from "next/navigation";
import ClientLayout from "./ClientLayout";
import { Suspense } from "react";
import ChatButton from "@/components/chatbot/ChatButton"
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Spot-On",
  description: "Spot-On App",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/icons/pwa-icon-128.png",
    shortcut: "/images/icons/pwa-icon-128.png",
    apple: "/images/icons/pwa-icon-128.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${inter.variable}`}>
        <ClientLayout>
          <ShowComponents>
            <Navbar />
          </ShowComponents>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>{" "}
          <Footer />
          <ChatButton />
          <Toaster richColors position="top-center" />
        </ClientLayout>
      </body>
    </html>
  );
}
