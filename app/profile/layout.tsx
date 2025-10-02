import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - Your Casaway Account",
  description: "View and manage your Casaway profile. Update your information, view your listings, and manage your home swap activities.",
  keywords: ["profile", "account settings", "user profile", "casaway profile", "home swap profile"],
  robots: {
    index: false, // Don't index user profiles
    follow: true,
  },
  openGraph: {
    title: "Profile - Your Casaway Account",
    description: "View and manage your Casaway profile. Update your information and manage your housing listings.",
    url: "/profile",
  },
  twitter: {
    title: "Profile - Your Casaway Account",
    description: "View and manage your Casaway profile. Update your information and manage your housing listings.",
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
