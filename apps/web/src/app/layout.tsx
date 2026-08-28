import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grooveli | Web3 Music Licensing & Marketplace",
  description: "Discover, stream, and license high-quality beats, podcasts, and songs with on-chain ownership on Grooveli.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { Web3Provider } from "@/components/providers/web3-provider";
import { MusicPlayerProvider } from "@/components/marketplace/MusicPlayerContext";
import { PreviewLimitModal } from "@/components/marketplace/PreviewLimitModal";
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Web3Provider>
          <MusicPlayerProvider>
            {children}
            <PreviewLimitModal />
          </MusicPlayerProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1A1A24',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  );
}
