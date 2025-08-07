"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { use } from "react";

export default function InvitePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectWithToken = () => {
      if (!token) {
        setError("Missing invite token.");
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("inviteToken", token);
        localStorage.setItem("inviteAmbassador", name);
      }

      router.push("/auth?mode=register");
    };

    redirectWithToken();
  }, [token, name, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-semibold mb-2">Redirecting to registration...</h1>
      {loading && <p className="text-gray-500">Preparing your invite link...</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
