// app/referral/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import {
  FacebookShareButton,
  WhatsappShareButton,
  TwitterShareButton,
} from 'react-share';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ReferralPage() {
  const [userId, setUserId] = useState<string>('');
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [points, setPoints] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
    const parsedUser = JSON.parse(storedUser);
    console.log('[Referral Page] Loaded user ID:', parsedUser._id);
    setUserId(parsedUser._id);
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE_URL}/api/referral/${userId}`)
      .then(res => res.json())
      .then(data => {
        console.log('[Referral Page] API Response:', data);
        setReferralCode(data.referralCode);
        setReferralLink(data.referralLink);
        setPoints(data.points);
        setReferralCount(data.referralCount);
      })
      .catch(err => console.error('Error fetching referral data:', err));
  }, [userId]);

  const handleCopy = () => {
    if (!referralLink) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralLink).then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      }).catch(() => setCopySuccess('Copy failed.'));
    } else {
      const input = document.createElement('input');
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopySuccess('Copied (fallback)');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const handleRedeem = async (rewardName: string, cost: number) => {
    if (!userId) return alert('Please log in first.');

    if (points < cost) {
      return alert('Not enough points to redeem this reward.');
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, rewardName, cost }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Redemption failed');

      setMessage('Redemption successful!');
      setPoints((prev) => prev - cost);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-ambient pt-[12vh] px-6">
      <h1 className="text-2xl font-bold text-forest mb-6">Referral Program</h1>

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-100 text-yellow-800 font-medium">
          {message}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Referral Link</h2>
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
          <div className="flex gap-4 mt-4">
            <FacebookShareButton url={referralLink}>
              <Icon icon="logos:facebook" className="w-6 h-6" />
            </FacebookShareButton>
            <WhatsappShareButton url={referralLink}>
              <Icon icon="logos:whatsapp" className="w-6 h-6" />
            </WhatsappShareButton>
            <TwitterShareButton url={referralLink}>
              <Icon icon="logos:twitter" className="w-6 h-6" />
            </TwitterShareButton>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Your Stats</h2>
          <p><strong>Referrals:</strong> {referralCount}</p>
          <p><strong>Points:</strong> {points}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Rewards Catalog</h2>
          <div className="space-y-2">
            <div className="border p-3 rounded-lg flex justify-between items-center">
              <span>₹100 Amazon Gift Card</span>
              <button
                onClick={() => handleRedeem('₹100 Amazon Gift Card', 100)}
                disabled={points < 100}
                className={`text-white px-3 py-1 rounded-lg text-sm ${points < 100 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                Redeem
              </button>
            </div>
            <div className="border p-3 rounded-lg flex justify-between items-center">
              <span>₹200 Flipkart Voucher</span>
              <button
                onClick={() => handleRedeem('₹200 Flipkart Voucher', 200)}
                disabled={points < 200}
                className={`text-white px-3 py-1 rounded-lg text-sm ${points < 200 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                Redeem
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}