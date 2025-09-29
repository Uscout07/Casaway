"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

async function expandShortToken(shortId: string): Promise<string | null> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${backendUrl}/api/auth/expand-invite?t=${encodeURIComponent(shortId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.token || null;
  } catch {
    return null;
  }
}
import { use } from "react";

export default function InvitePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const shortParam = searchParams.get("t");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectWithToken = async () => {
      let resolvedToken = token;
      if (!resolvedToken && shortParam) {
        resolvedToken = await expandShortToken(shortParam);
      }
      if (!resolvedToken) {
        setError("Missing invite token.");
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("inviteToken", resolvedToken);
        localStorage.setItem("inviteAmbassador", name);
      }

      router.push("/auth?mode=register");
    };

    void redirectWithToken();
  }, [token, shortParam, name, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-semibold mb-2">Redirecting to registration...</h1>
      {loading && <p className="text-gray-500">Preparing your invite link...</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
