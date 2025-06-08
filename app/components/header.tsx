'use client';

import { Icon } from "@iconify/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface User {
  _id: string;
  name: string;
  username: string;
  profilePic?: string;
}

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // New loading state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false); // No token, so not loading user data
        return;
      }

      setLoading(true); // Start loading
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setUser(null); // Clear user if fetch failed
          return;
        }

        const data = await res.json();
        console.log("Fetched user data:", data);

        const userData = {
          ...data,
          _id: data._id?.toString() || data.id?.toString() || "",
        };

        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null); // Clear user on error
      } finally {
        setLoading(false); // End loading regardless of success or failure
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth");
  };

  return (
    <header className="px-6 py-6 w-screen fixed flex-1 flex items-center justify-between top-0 z-50 font-inter bg-ambient h-[9vh]">
      <div className="w-full mx-auto flex items-center justify-between px-20">
        <Image className="w-[32px] h-[32px]" src="/logo.png" alt={"Logo"} />

        <nav className="flex space-x-16 items-center">
          <a href="/" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Home</a>
          <a href="/search" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Search</a>
          <a href="/chat" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Chat</a>
          <a href="/upload" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Post</a>
          <a href="/settings" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Settings</a>
        </nav>

        <div className="relative" ref={dropdownRef}>
          {loading ? (
            // Loading state for profile picture
            <div className="w-[32px] h-[32px] rounded-full overflow-hidden bg-forest-medium animate-pulse">
              {/* You can add a subtle shimmer effect here */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-forest-medium to-transparent opacity-0 animate-shimmer"></div>
            </div>
          ) : (
            // User data loaded, show profile picture
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-[32px] h-[32px] rounded-full overflow-hidden focus:outline-none"
            >{ user?.profilePic != "" ?
              (<img
                src={user?.profilePic}
                alt="Profile"
                className="w-full h-full object-cover"
              />) : (<Icon icon="mdi:account-circle" className="w-full h-full text-gray-500" />)}
            </button>
          )}

          {dropdownOpen && !loading && ( // Only show dropdown if not loading and user is loaded
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
              <button
                onClick={() => {
                  if (user?._id) {
                    router.push(`/profile/${user._id}`);
                  }
                }}
                className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 w-full text-left"
              >
                View Profile
              </button>
              <button
                onClick={handleLogout}
                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}