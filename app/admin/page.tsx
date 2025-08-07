"use client";
import React, { useState } from "react";

export default function AdminPanel() {
  const [name, setName] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [status, setStatus] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    setStatus(null);
    setInviteLink(null);
    setCopied(false);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/auth/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to generate link");

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      setInviteLink(`${siteUrl}${data.invitePath}`);
      setStatus("Link generated! 🎉 Copy below:");
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      <div className="mb-4">
        <label className="block mb-1">Invitee Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          placeholder="Alice"
        />
      </div>

      <button
        onClick={generateLink}
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Invite Link"}
      </button>

      {status && (
        <p className="mt-3 text-sm">
          {inviteLink ? (
            <span className="text-green-600">{status}</span>
          ) : (
            <span className="text-red-600">{status}</span>
          )}
        </p>
      )}

      {inviteLink && (
        <div className="mt-4">
          <label className="block mb-1">Invite Link</label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={inviteLink}
              className="w-full border px-3 py-2 rounded bg-gray-100"
              onFocus={e => e.currentTarget.select()}
            />
            <button
              onClick={handleCopy}
              className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
