'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import {
  FacebookShareButton,
  WhatsappShareButton,
  TwitterShareButton,
} from 'react-share';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Reward {
  brandKey: string;
  displayName: string;
  imageUrls?: string[];
  cost: number;
}

interface User {
  _id: string;
  name: string;
  username: string;
  role: "user" | "admin" | "ambassador";
}

const brandNameMap: Record<string, string> = {
  B916708: 'Amazon.com',
  B795341: 'Uber',
};

export default function ReferralPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [points, setPoints] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(true);

  useEffect(() => {
    const checkUserAccess = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          router.push("/auth");
          return;
        }

        const userData = await res.json();
        
        // Check if user is an ambassador
        if (userData.role !== "ambassador") {
          router.push("/"); // Redirect to home if not an ambassador
          return;
        }

        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        localStorage.removeItem("token");
        router.push("/auth");
      }
    };

    checkUserAccess();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    fetch(`${API_BASE_URL}/api/referral/${user._id}`)
      .then(res => res.json())
      .then(data => {
        setReferralCode(data.referralCode);
        setReferralLink(data.referralLink);
        setPoints(data.points);
        setReferralCount(data.referralCount);
      })
      .catch(err => console.error('Error fetching referral data:', err));
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetch(`${API_BASE_URL}/api/rewards/catalog`)
      .then(res => res.json())
      .then((data: { brands: Reward[] }) => {
        setRewards(data.brands);
        setRewardsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching catalog:', err);
        setRewardsLoading(false);
      });
  }, [user]);

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(() => {
        setCopySuccess('Copy failed.');
        setTimeout(() => setCopySuccess(''), 2000);
      });
  };

  const handleRedeem = async (brandKey: string, cost: number) => {
    if (!user) return alert('Please log in first.');

    if (points < cost) {
      return alert('Not enough points to redeem this reward.');
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, brandKey, value: cost }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Redemption failed');

      setMessage('Redemption successful!');
      setPoints(prev => prev - cost);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage(err.message || 'Something went wrong');
    }
  };

  // Show loading state while checking user access
  if (loading) {
    return (
      <div className="min-h-screen bg-ambient pt-[12vh] px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-forest">Loading...</p>
        </div>
      </div>
    );
  }

  // This should not render if user is not ambassador due to redirect, but adding as fallback
  if (!user || user.role !== "ambassador") {
    return (
      <div className="min-h-screen bg-ambient pt-[12vh] px-6 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="mdi:lock" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-forest mb-2">Access Denied</h1>
          <p className="text-slate">This page is only available for ambassadors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ambient pt-[12vh] px-6 flex flex-col gap-8 text-slate">
      <h1 className="text-2xl font-bold text-forest">Referral Program</h1>

      {message && (
        <div className="p-3 rounded-lg bg-yellow-100 text-yellow-800 font-medium">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg p-6 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-forest">Your Referral Link</h2>
        <div className="flex items-center gap-3">
          <input
            value={referralLink}
            readOnly
            className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700"
          />
          <button
            onClick={handleCopy}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            {copySuccess || 'Copy'}
          </button>
        </div>
        {referralLink && (
          <div className="flex gap-2">
            <FacebookShareButton url={referralLink}>
              <Icon icon="logos:facebook" className="w-6 h-6" />
            </FacebookShareButton>
            <WhatsappShareButton url={referralLink}>
              <Icon icon="logos:whatsapp-icon" className="w-8 h-8" />
            </WhatsappShareButton>
            <TwitterShareButton url={referralLink}>
              <Icon icon="devicon:twitter" className="w-5 h-5" />
            </TwitterShareButton>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-lg p-6 bg-white">
          <h2 className="text-xl font-semibold mb-2 text-forest">Your Stats</h2>
          <p><strong>Referrals:</strong> {referralCount}</p>
          <p><strong>Points:</strong> {points}</p>
        </div>

        <div className="rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-forest text-center">Rewards Catalog</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rewardsLoading ? (
              <p className="text-gray-500 animate-pulse">Loading rewards...</p>
            ) : rewards.length === 0 ? (
              <p className="text-red-500">No rewards available.</p>
            ) : (
              rewards.map((reward, idx) => {
                const lastImage = reward.imageUrls?.[reward.imageUrls.length - 1];
                const name = brandNameMap[reward.brandKey] || reward.displayName;
                return (
                  <div
                    key={idx}
                    className="border p-8 rounded-lg flex flex-col items-center text-center gap-4 bg-forest-light"
                  >
                    {lastImage && (
                      <img
                        src={lastImage}
                        alt={name}
                        className="w-80 h-auto object-contain rounded"
                      />
                    )}
                    <h3 className="text-lg font-semibold text-forest">{name}</h3>
                    <p className="text-gray-600 text-sm">$10 <b>{name}</b> Gift Card</p>
                    <button
                      // onClick={() => handleRedeem(reward.brandKey, reward.cost)}
                      // disabled={points < reward.cost}
                      disabled= {true}
                      className={`text-white px-4 py-2 rounded-lg text-sm ${
                        points < reward.cost
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {/* Redeem ({reward.cost} pts) */} Available on launch
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}