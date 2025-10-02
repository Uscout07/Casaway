import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home - Discover Home Swaps Worldwide",
  description: "Browse available home swaps, room exchanges, and stays from people around the world. Find your perfect home exchange on Casaway.",
  keywords: ["home swap search", "home exchange listings", "house swap", "apartment swap", "vacation home exchange"],
  openGraph: {
    title: "Home - Discover Home Swaps Worldwide | Casaway",
    description: "Browse available home swaps, room exchanges, and stays from people around the world.",
    url: "/home",
  },
  twitter: {
    title: "Home - Discover Home Swaps Worldwide | Casaway",
    description: "Browse available home swaps, room exchanges, and stays from people around the world.",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
