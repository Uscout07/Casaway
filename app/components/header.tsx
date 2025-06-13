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
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false); // 👈 New
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

  const renderProfileImage = () => {
    if (imageError || !user?.profilePic) {
      return <Icon icon="mdi:account-circle" className="max-md:w-[40px] max-md:h-[40px] w-[32px] h-[32px] text-gray-500" />;
    }
    return (
      <img
        src={user.profilePic}
        alt="Profile"
        className="max-md:w-[40px] max-md:h-[40px] w-[32px] h-[32px] object-cover"
        onError={() => setImageError(true)} // 👈 Important
      />
    );
  };

  return (
    <header className="px-6 md:py-6 w-full fixed flex-1 flex items-center justify-between  font-inter bg-ambient md:h-[9vh] z-50">
      <div className="top-0 z-50 w-full mx-auto flex items-center justify-between px-20 max-md:hidden">
        <Image width={32} height={32} src="/logo.png" alt="Logo" />

        <nav className="flex space-x-16 items-center">
          <a href="/" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Home</a>
          <a href="/search" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Search</a>
          <a href="/upload" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Upload</a>
          <a href="/messages" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Messages</a>
          <a href="/settings" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Settings</a>
        </nav>

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

      <div className="flex items-center justify-between w-full h-[8vh] md:hidden">
        <Image width={48} height={48} src="/logo.png" alt="Logo" className="md:w-10 md:h-10" />

        <div className="relative" ref={dropdownRef}>
          {loading ? (
            <div className="w-[40px] h-[40px] rounded-full overflow-hidden bg-forest-medium animate-pulse" />
          ) : (
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className=" rounded-full overflow-hidden focus:outline-none"
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
    </header>
  );
}
