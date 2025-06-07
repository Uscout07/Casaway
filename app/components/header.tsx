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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();
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
        <Image width={32} height={32} src="/logo.png" alt="Logo" priority />

        <nav className="flex space-x-16 items-center">
          <a href="/" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Home</a>
          <a href="/search" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Search</a>
          <a href="/chat" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Chat</a>
          <a href="/upload" className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out">Upload</a>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
                {user.profilePic ? (
                  <Image
                    width={32}
                    height={32}
                    src={`${baseUrl}${user.profilePic}`}
                    alt="Profile Pic"
                    className="rounded-full object-cover"
                  />
                ) : (
                  <Icon icon="mdi:account-circle" className="text-3xl text-forest" />
                )}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50">
                  <a href={`/profile/${user.username}`} className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100">Profile</a>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push("/auth")}
              className="text-forest font-bold text-[12px] hover:opacity-75 hover:scale-105 transition-all duration-300 ease-in-out"
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
