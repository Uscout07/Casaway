import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - Manage Your Casaway Account",
  description: "Manage your Casaway account settings, privacy preferences, and notification settings. Update your profile information and account security.",
  keywords: ["settings", "account settings", "privacy settings", "notification settings", "account management"],
  robots: {
    index: false, // Don't index settings pages
    follow: true,
  },
  openGraph: {
    title: "Settings - Manage Your Casaway Account",
    description: "Manage your Casaway account settings, privacy preferences, and notification settings.",
    url: "/settings",
  },
  twitter: {
    title: "Settings - Manage Your Casaway Account",
    description: "Manage your Casaway account settings, privacy preferences, and notification settings.",
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
