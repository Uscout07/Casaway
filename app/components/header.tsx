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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        console.log("Fetched user data:", data);

        // Ensure _id is string and exists
        const userData = {
          ...data,
          _id: data._id?.toString() || data.id?.toString() || "",
        };

        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
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
        <Image className="w-[32px] h-[32px]" src="https://github.com/Uscout07/Casaway/blob/main/public/Logo.png" alt={"Logo"} />

        <nav className="flex space-x-16 items-center">
          <a href="/" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Home</a>
          <a href="/search" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Search</a>
          <a href="/chat" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Chat</a>
          <a href="/upload" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Post</a>
          <a href="/settings" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Settings</a>
        </nav>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-[32px] h-[32px] rounded-full overflow-hidden focus:outline-none"
          >
            <Image
              src={user?.profilePic || "/default-avatar.png"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>

          {dropdownOpen && (
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
