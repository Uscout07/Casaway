'use client';

import { Icon } from "@iconify/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from 'next/link'


interface User {
  _id: string;
  name: string;
  username: string;
  profilePic?: string;
  role: "user" | "admin" | "ambassador";
}

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();
        const userData = {
          ...data,
          _id: data._id?.toString() || data.id?.toString() || "",
        };

        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the dropdown's container
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Use the functional update to avoid stale state issues with setDropdownOpen
        setDropdownOpen(false);
      }
    };

    // Use the 'click' event instead of 'mousedown'
    // This helps prevent race conditions
    document.addEventListener("click", handleClickOutside);

    // Clean up the event listener on unmount
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth");
  };

  const renderProfileImage = () => {
    if (imageError || !user?.profilePic) {
      return <Icon icon="mdi:account-circle" className="max-md:w-[40px] max-md:h-[40px] w-[32px] h-[32px] text-gray-500" />;
    }
    return (
      <img
        src={user.profilePic}
        alt="Profile"
        className="max-md:w-[40px] max-md:h-[40px] w-[32px] h-[32px] object-cover"
        onError={() => setImageError(true)}
      />
    );
  };

  return (
    <header className="px-6 md:py-6 w-full fixed flex-1 flex items-center justify-between font-inter bg-ambient md:h-[9vh] z-50">
      <div className="top-0 z-50 w-full mx-auto flex items-center justify-between px-20 max-md:hidden">
        <div className="flex items-center space-x-2">
          <Image width={32} height={32} src="/logo.png" alt="Logo" />
          <span className="text-forest font-bold text-lg">Casaway</span>
        </div>

        <nav className="flex space-x-16 items-center">
          <Link href="/" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Home</Link>
          <Link href="/search" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Search</Link>
          <Link href="/upload" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Upload</Link>
          <Link href="/messages" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Messages</Link>
          <Link href="/settings" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Settings</Link>
          {user?.role === "ambassador" && (
            <Link href="/referral" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Refer a Friend</Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Admin</Link>
          )}
        </nav>
        <div className="flex items-center gap-5">
          <Link href="/notifications" className="w-[32px] h-[32px] rounded-full bg-forest-light flex items-center justify-center hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">
            <Icon icon="ph:bell-duotone" width="24" height="24" className="text-forest" />
          </Link>
          <div className="relative" ref={dropdownRef}>
            {loading ? (
              <div className="w-[32px] h-[32px] rounded-full overflow-hidden bg-forest-medium animate-pulse" />
            ) : (
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-[32px] h-[32px] rounded-full overflow-hidden focus:outline-none"
              >
                {renderProfileImage()}
              </button>
            )}

            {dropdownOpen && !loading && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                <button
                  onClick={() => {
                    if (user?._id) router.push(`/profile/${user._id}`);
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
      </div>

      {/* Mobile Navbar */}
      <div className="flex items-center justify-between w-full max-[376px]:h-[10vh] h-[8vh] md:hidden px-4">
        <div className="flex items-center space-x-2">
          <Image width={48} height={48} src="/logo.png" alt="Logo" className="md:w-10 md:h-10" />
        </div>
        <div className="flex items-center gap-5">
          <Link href="/notifications" className="w-[40px] h-[40px] rounded-full bg-forest-light flex items-center justify-center hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">
            <Icon icon="ph:bell-duotone" width="28" height="28" className="text-forest" />
          </Link>
          <div className="relative" ref={dropdownRef}>
            {loading ? (
              <div className="w-[40px] h-[40px] rounded-full overflow-hidden bg-forest-medium animate-pulse" />
            ) : (
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="rounded-full overflow-hidden focus:outline-none"
              >
                {renderProfileImage()}
              </button>
            )}

            {dropdownOpen && !loading && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                {user?._id && (
                  <button
                    onClick={() => {
                      if (user?._id) router.push(`/profile/${user._id}`);
                    }}
                    className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 w-full text-left"
                  >
                    View your Profile
                  </button>
                )}
                {user?.role === "admin" && (
                  <button
                    onClick={() => {
                      if (user?._id) router.push(`/admin`);
                    }}
                    className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 w-full text-left md:hidden"
                  >
                    View your Profile
                  </button>)}
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
      </div>
    </header>
  );
}