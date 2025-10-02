import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Listing - Share Your Home for Swapping",
  description: "Create and share your home swap listing on Casaway. List your room, apartment, or house for others to discover and exchange with.",
  keywords: ["upload listing", "create listing", "home swap post", "room listing", "apartment swap", "home exchange"],
  openGraph: {
    title: "Upload Listing - Share Your Home for Swapping | Casaway",
    description: "Create and share your home swap listing on Casaway. List your room, apartment, or house for others to discover.",
    url: "/upload",
  },
  twitter: {
    title: "Upload Listing - Share Your Home for Swapping | Casaway",
    description: "Create and share your home swap listing on Casaway. List your room, apartment, or house for others to discover.",
  },
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
