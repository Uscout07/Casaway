import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Join Casaway Home Swapping Platform",
  description: "Create your free Casaway account to start listing your home, finding exchanges, and connecting with people worldwide for home swaps.",
  keywords: ["sign up", "register", "create account", "join casaway", "home swap signup", "home exchange registration"],
  openGraph: {
    title: "Sign Up - Join Casaway Home Swapping Platform",
    description: "Create your free Casaway account to start listing your home and finding exchanges worldwide.",
    url: "/register",
  },
  twitter: {
    title: "Sign Up - Join Casaway Home Swapping Platform",
    description: "Create your free Casaway account to start listing your home and finding exchanges worldwide.",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
