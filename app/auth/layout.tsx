import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Join Casaway Home Swapping Platform",
  description: "Sign in to Casaway to access home swap listings, create your own posts, and connect with people worldwide for home exchanges.",
  keywords: ["home swap login", "sign in", "casaway login", "home exchange account", "room swap login"],
  robots: {
    index: false, // Don't index login pages
    follow: true,
  },
  openGraph: {
    title: "Sign In - Join Casaway Home Swapping Platform",
    description: "Sign in to Casaway to access home swap listings and connect with people worldwide.",
    url: "/auth",
  },
  twitter: {
    title: "Sign In - Join Casaway Home Swapping Platform",
    description: "Sign in to Casaway to access home swap listings and connect with people worldwide.",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
