"use client";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

interface InviteData {
  id: string;
  name: string;
  link: string;
  createdAt: string;
  used: boolean;
}

export default function AdminPanel() {
  const [name, setName] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [status, setStatus] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invites, setInvites] = useState<InviteData[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'manage'>('generate');
  const [stats, setStats] = useState({
    totalInvites: 0,
    usedInvites: 0,
    pendingInvites: 0
  });

  // Load existing invites and stats
  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      const token = localStorage.getItem("token");
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/admin/invites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvites(data.invites || []);
        setStats({
          totalInvites: data.invites?.length || 0,
          usedInvites: data.invites?.filter((inv: InviteData) => inv.used).length || 0,
          pendingInvites: data.invites?.filter((inv: InviteData) => !inv.used).length || 0
        });
      }
    } catch (err) {
      console.error('Failed to load invites:', err);
    }
  };

  const generateLink = async () => {
    if (!name.trim()) {
      setStatus("Please enter a name");
      return;
    }

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
        body: JSON.stringify({ name: name.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to generate link");

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const fullLink = `${siteUrl}${data.invitePath}`;
      setInviteLink(fullLink);
      setStatus("success");
      setName(""); // Clear the input
      loadInvites(); // Refresh the list
    } catch (err: any) {
      setStatus("error");
      console.error('Error generating invite:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (inviteLink) {
      try {
        await navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const copyInviteLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-light/10 to-ambient/10 p-4 pt-[15vh]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
              <p className="text-gray-600">Manage invites and monitor platform activity</p>
            </div>
            <div className="flex items-center gap-2 text-forest">
              <Icon icon="ph:shield-check" className="text-2xl" />
              <span className="font-semibold">Admin Access</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invites</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInvites}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Icon icon="ph:link" className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Used Invites</p>
                <p className="text-2xl font-bold text-green-600">{stats.usedInvites}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Icon icon="ph:check-circle" className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Invites</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingInvites}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Icon icon="ph:clock" className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
        </div> */}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'generate'
                    ? 'text-forest border-b-2 border-forest bg-forest-light/10'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon icon="ph:plus-circle" className="inline mr-2" />
                Generate Invite
              </button>
              {/* <button
                onClick={() => setActiveTab('manage')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'manage'
                    ? 'text-forest border-b-2 border-forest bg-forest-light/10'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon icon="ph:list" className="inline mr-2" />
                Manage Invites
              </button> */}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'generate' && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate New Invite</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invitee Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent transition-colors"
                      placeholder="Enter the person's name"
                      onKeyPress={e => e.key === 'Enter' && generateLink()}
                    />
                  </div>

                  <button
                    onClick={generateLink}
                    disabled={loading || !name.trim()}
                    className={`w-full bg-forest text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      loading || !name.trim()
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-forest-dark hover:shadow-lg"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Icon icon="ph:spinner" className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Icon icon="ph:plus" />
                        Generate Invite Link
                      </>
                    )}
                  </button>

                  {status === 'success' && inviteLink && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon icon="ph:check-circle" className="text-green-600 text-xl" />
                        <span className="text-green-800 font-semibold">Invite generated successfully!</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Invite Link</label>
                          <div className="flex items-center gap-2">
                            <input
                              readOnly
                              value={inviteLink}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm font-mono"
                              onFocus={e => e.currentTarget.select()}
                            />
                            <button
                              onClick={handleCopy}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                copied
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {copied ? (
                                <>
                                  <Icon icon="ph:check" className="inline mr-1" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Icon icon="ph:copy" className="inline mr-1" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Icon icon="ph:warning-circle" className="text-red-600 text-xl" />
                        <span className="text-red-800 font-semibold">Failed to generate invite</span>
                      </div>
                      <p className="text-red-700 text-sm mt-1">Please try again or contact support.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* {activeTab === 'manage' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Manage Invites</h2>
                
                {invites.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon icon="ph:link-break" className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No invites generated yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invites.map((invite) => (
                          <tr key={invite.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{invite.name}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                invite.used
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                <Icon 
                                  icon={invite.used ? "ph:check-circle" : "ph:clock"} 
                                  className="mr-1" 
                                />
                                {invite.used ? 'Used' : 'Pending'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{formatDate(invite.createdAt)}</td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => copyInviteLink(invite.link)}
                                className="text-forest hover:text-forest-dark transition-colors"
                                title="Copy invite link"
                              >
                                <Icon icon="ph:copy" className="text-lg" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
