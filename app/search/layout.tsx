import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search - Find Home Swaps Worldwide",
  description: "Search for home exchanges, room swaps, and stays worldwide. Filter by location, dates, and preferences to find your perfect home swap.",
  keywords: ["home swap search", "home exchange search", "find home swap", "house swap", "apartment swap", "room swap"],
  openGraph: {
    title: "Search - Find Home Swaps Worldwide | Casaway",
    description: "Search for home exchanges, room swaps, and stays worldwide. Filter by location, dates, and preferences.",
    url: "/search",
  },
  twitter: {
    title: "Search - Find Home Swaps Worldwide | Casaway",
    description: "Search for home exchanges, room swaps, and stays worldwide. Filter by location, dates, and preferences.",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
