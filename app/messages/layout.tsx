import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages - Chat about Home Swaps",
  description: "Connect and chat with others about home swap opportunities. Send messages, discuss details, and coordinate your exchange.",
  keywords: ["messages", "chat", "home swap chat", "exchange discussion", "home exchange communication"],
  robots: {
    index: false, // Don't index private messages
    follow: true,
  },
  openGraph: {
    title: "Messages - Chat about Home Swaps | Casaway",
    description: "Connect and chat with others about home swap opportunities. Send messages and discuss details.",
    url: "/messages",
  },
  twitter: {
    title: "Messages - Chat about Home Swaps | Casaway",
    description: "Connect and chat with others about home swap opportunities. Send messages and discuss details.",
  },
};

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}