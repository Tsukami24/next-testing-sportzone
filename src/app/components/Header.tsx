"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "../services/auth";

export default function Header() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    async function init() {
      try {
        const stored = localStorage.getItem("token");
        if (stored) {
          setToken(stored);
          const res = await getProfile(stored);
          if (res?.user) setProfile(res.user);
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setProfile(null);
    router.push("/login");
  }

  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "Products", href: "/produk" },
    { name: "Categories", href: "/kategori" },
    { name: "Brands", href: "/brand" },
  ];

  if (profile?.role?.name === "petugas" || profile?.role?.name === "admin") {
    navLinks.push({ name: "Staff", href: "/petugas" });
  }

  return (
    <header className="bg-[#5b0675ff] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <h1
              className="text-xl font-bold text-white cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push("/home")}
            >
              E-Commerce
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white hover:opacity-80 px-3 py-2 rounded-md text-sm font-medium transition-opacity"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {token ? (
              <div className="relative">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex items-center text-sm rounded-full focus:outline-none hover:opacity-80 p-1 transition-opacity"
                >
                  <span className="mr-2 text-sm font-medium text-white">
                    {profile?.username || profile?.email || "User"}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#5b0675ff] font-semibold">
                    {(
                      profile?.username?.[0] ||
                      profile?.email?.[0] ||
                      "U"
                    ).toUpperCase()}
                  </div>
                </button>

                {mobileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <a
                      href="/pesanan/history"
                      className="block px-4 py-2 text-sm text-[#5b0675ff] hover:bg-gray-100 transition"
                    >
                      My Orders
                    </a>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-[#5b0675ff] hover:bg-gray-100 transition"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/login"
                className="text-white hover:opacity-80 px-3 py-2 rounded-md text-sm font-medium transition-opacity"
              >
                Login
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:opacity-80 focus:outline-none transition-opacity"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#5b0675ff] shadow-sm">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-white hover:opacity-80 transition-opacity"
              >
                {link.name}
              </a>
            ))}

            {token ? (
              <>
                <a
                  href="/pesanan/history"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-white hover:opacity-80 transition-opacity"
                >
                  My Orders
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-white hover:opacity-80 transition-opacity"
                >
                  Sign out
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-white hover:opacity-80 transition-opacity"
              >
                Login
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
