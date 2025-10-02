/**
 * Root Layout - Next.js App Router Root Layout
 * 
 * This is the root layout component for the Casaway Prelaunch web application.
 * It wraps all pages and provides global configuration including:
 * 
 * - Metadata configuration for SEO and social media
 * - Global CSS styles and fonts
 * - Authentication context provider
 * - Protected route wrapper
 * - Structured data for search engines
 * - Leaflet CSS for map components
 * 
 * The layout uses Next.js 13+ App Router architecture with server components
 * by default and client components when needed.
 * 
 * @author Casaway Development Team
 * @version 1.0.0
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
import ProtectedLayout from "./components/ProtectedLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { WebSiteStructuredData, OrganizationStructuredData } from "./components/StructuredData";


/**
 * Font Configuration
 * 
 * Configure Inter font family for the application with:
 * - Latin character subset for optimal loading
 * - CSS variable for consistent usage across components
 * - Optimized font loading for better performance
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

/**
 * Root Metadata Configuration
 * 
 * Comprehensive metadata setup for SEO, social media sharing,
 * and search engine optimization. Includes:
 * 
 * - Dynamic title templates with fallbacks
 * - Comprehensive meta descriptions and keywords
 * - Open Graph tags for social media sharing
 * - Twitter Card configuration
 * - Robots and search engine directives
 * - Google site verification
 * - Canonical URL configuration
 * 
 * This metadata is applied to all pages by default and can be
 * overridden by individual page metadata exports.
 */
export const metadata: Metadata = {
  title: {
    default: "Casaway - Home Swapping Platform",
    template: "%s | Casaway"
  },
  description: "Swap homes and find trusted home exchanges worldwide. Discover stays, list your place, and coordinate smooth swaps with Casaway.",
  keywords: [
    "home swap",
    "home exchange",
    "house swap",
    "apartment swap",
    "holiday swap",
    "vacation home exchange",
    "room swap",
    "home sharing",
    "travel swap",
    "home exchange platform"
  ],
  authors: [{ name: "Casaway Team" }],
  creator: "Casaway",
  publisher: "Casaway",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://casaway.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://casaway.vercel.app',
    title: 'Casaway - Home Swapping Platform',
    description: 'Swap homes and find trusted home exchanges worldwide. Discover stays, list your place, and coordinate smooth swaps with Casaway.',
    siteName: 'Casaway',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Casaway - Home Swapping Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Casaway - Home Swapping Platform',
    description: 'Swap homes and find trusted home exchanges worldwide.',
    images: ['/og-image.png'],
    creator: '@casawayapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <WebSiteStructuredData />
        <OrganizationStructuredData />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased max-md:h-full w-full overflow-x-hidden m-0 p-0`}
      >
        <AuthProvider>
          <ProtectedLayout>{children}</ProtectedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}